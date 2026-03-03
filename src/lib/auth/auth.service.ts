import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword } from './hash';
import { RegisterInput, LoginInput } from '@/lib/validators/auth.validator';
import { UserStatus } from '@prisma/client';
import crypto from 'crypto';

export class AuthService {
  static async register(data: RegisterInput) {
    // Prevent admin self-registration
    if (data.role === 'ADMIN') {
      throw new Error('Admin cannot self-register');
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await hashPassword(data.password);

    // Transaction to create user and profile
    await prisma.$transaction(async (tx) => {
      const isDoctor = data.role === 'DOCTOR';
      const initialStatus = isDoctor ? UserStatus.PENDING_APPROVAL : UserStatus.ACTIVE;

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: data.role,
          status: initialStatus,
        },
      });

      if (data.role === 'DOCTOR') {
        await tx.doctor.create({
          data: {
            userId: user.id,
            name: data.fullName,
            // No department, specialization, or license yet
          },
        });
      } else if (data.role === 'PATIENT') {
        await tx.patient.create({
          data: {
            userId: user.id,
            name: data.fullName,
            contact: data.phone,
          },
        });
      }
    });

    return { 
      success: true, 
      message: data.role === 'DOCTOR' 
        ? 'Your doctor account is pending admin approval.' 
        : 'User registered successfully' 
    };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is temporarily locked. Please try again later.');
    }

    const isValid = await comparePassword(data.password, user.passwordHash);

    if (!isValid) {
      // Increment login attempts
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: { increment: 1 } },
      });

      if (updatedUser.loginAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }, // Lock for 15 mins
        });
      }
      
      throw new Error('Invalid credentials');
    }

    // Allow PENDING_APPROVAL users to login so they can be redirected to the pending page
    // by the middleware or frontend logic.
    if (user.status !== UserStatus.ACTIVE && user.status !== UserStatus.PENDING_APPROVAL) {
      throw new Error('Account is not active');
    }

    // Reset attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      },
    });

    return user;
  }
}
