import { prisma } from '@/lib/prisma'
import { Role, UserStatus } from '@prisma/client'
import { comparePassword, hashPassword } from '@/lib/auth/hash'
import {
  getProfileUpdateSchema,
  passwordChangeSchema,
  type PasswordChangeInput,
} from '@/lib/validators/profile.validator'

export class ProfileService {
  async getProfile(userId: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: userId },
        include: { department: { select: { id: true, name: true } } },
      })
      if (!doctor) throw new Error('Doctor profile not found')
      return {
        role: 'DOCTOR' as const,
        user: { email: user.email, status: user.status, createdAt: user.createdAt },
        profile: {
          name: doctor.name,
          specialization: doctor.specialization,
          licenseNo: doctor.licenseNo,
          contact: doctor.contact ?? null,
          department: doctor.department,
        },
      }
    }

    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: userId } })
      if (!patient) throw new Error('Patient profile not found')
      return {
        role: 'PATIENT' as const,
        user: { email: user.email, status: user.status, createdAt: user.createdAt },
        profile: {
          name: patient.name,
          dob: patient.dob ?? null,
          gender: patient.gender ?? null,
          contact: patient.contact ?? null,
          address: patient.address ?? null,
          emergencyContact: patient.emergencyContact ?? null,
        },
      }
    }

    // ADMIN
    return {
      role: 'ADMIN' as const,
      user: { email: user.email, status: user.status, createdAt: user.createdAt },
      profile: {},
    }
  }

  async updateProfile(userId: string, role: Role, input: Record<string, unknown>) {
    const schema = getProfileUpdateSchema(role)
    const data = schema.parse(input)

    // email change is allowed for all roles
    if (data.email) {
      await prisma.user.update({ where: { id: userId }, data: { email: data.email } })
    }

    if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId }, select: { id: true, licenseNo: true } })
      if (!doctor) throw new Error('Doctor profile not found')
      // departmentId and licenseNo cannot be changed here
      const { name, specialization, contact } = data as { name?: string; specialization?: string; contact?: string | null }
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { name, specialization, contact },
      })
    } else if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId } })
      if (!patient) throw new Error('Patient profile not found')
      const { name, dob, gender, contact, address, emergencyContact } = data as {
        name?: string
        dob?: string | null
        gender?: any
        contact?: string | null
        address?: string | null
        emergencyContact?: string | null
      }
      await prisma.patient.update({
        where: { id: patient.id },
        data: {
          name,
          dob: dob ? new Date(dob) : patient.dob,
          gender,
          contact,
          address,
          emergencyContact,
        },
      })
    } else {
      // ADMIN has only email update
    }

    return { success: true }
  }

  async changePassword(userId: string, input: PasswordChangeInput) {
    const { oldPassword, newPassword } = passwordChangeSchema.parse(input)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
    if (!user) throw new Error('User not found')

    const matches = await comparePassword(oldPassword, user.passwordHash)
    if (!matches) throw new Error('Old password is incorrect')

    const isSame = await comparePassword(newPassword, user.passwordHash)
    if (isSame) throw new Error('New password cannot be the same as old password')

    const newHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } })
    return { success: true }
  }

  async deactivateAccount(userId: string) {
    await prisma.user.update({ where: { id: userId }, data: { status: UserStatus.DEACTIVATED } })
    return { success: true }
  }
}

export const profileService = new ProfileService()

