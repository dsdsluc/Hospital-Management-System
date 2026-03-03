import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { signToken, JWTPayload } from './token';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export async function createSession(userId: string, userAgent?: string, ip?: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  const refreshToken = await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  // Log the login attempt/success
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'LOGIN',
      entity: 'Session',
      entityId: refreshToken.id,
      ipAddress: ip,
      userAgent: userAgent,
    },
  });

  return refreshToken.token;
}

export async function refreshSession(oldToken: string, userAgent?: string, ip?: string) {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  // Token reuse detection (Security Critical)
  if (storedToken.revoked) {
    // Revoke all tokens for this user as a security measure
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId },
      data: { revoked: true },
    });
    
    await prisma.auditLog.create({
      data: {
        userId: storedToken.userId,
        action: 'SECURITY_ALERT',
        entity: 'RefreshToken',
        metadata: { reason: 'Reuse of revoked token', token: oldToken },
        ipAddress: ip,
        userAgent: userAgent,
      },
    });
    
    throw new Error('Token reuse detected');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new Error('Refresh token expired');
  }

  // Rotate token
  const newToken = randomBytes(32).toString('hex');
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Transaction: Revoke old, create new
  const [_, newRefreshToken] = await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { 
        revoked: true, 
        replacedBy: newToken 
      },
    }),
    prisma.refreshToken.create({
      data: {
        token: newToken,
        userId: storedToken.userId,
        expiresAt: newExpiresAt,
      },
    }),
  ]);

  // Generate new Access Token
  const accessToken = await signToken({
    id: storedToken.user.id,
    role: storedToken.user.role,
    status: storedToken.user.status,
    email: storedToken.user.email,
  });

  return { accessToken, refreshToken: newRefreshToken.token };
}

export async function revokeSession(token: string) {
  await prisma.refreshToken.update({
    where: { token },
    data: { revoked: true },
  });
}

export async function revokeAllUserSessions(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}
