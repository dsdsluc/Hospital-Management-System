import { NextRequest } from 'next/server';
import { verifyToken } from './token';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    role: Role;
    email?: string;
    status: string;
  };
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export class PermissionError extends Error {
  constructor(message: string, public statusCode: number = 403) {
    super(message);
    this.name = 'PermissionError';
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedRequest> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('No authorization token provided');
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    throw new AuthError('Invalid or expired token');
  }

  if (payload.status !== 'ACTIVE') {
    throw new AuthError('User account is not active');
  }

  return Object.assign(request, {
    user: {
      id: payload.id,
      role: payload.role as Role,
      email: payload.email,
      status: payload.status,
    },
  });
}

export function requireRole(roles: Role[]) {
  return (request: AuthenticatedRequest): void => {
    if (!roles.includes(request.user.role)) {
      throw new PermissionError(`Role ${request.user.role} is not authorized for this operation`);
    }
  };
}

export function requireOwnership(
  request: AuthenticatedRequest,
  resourceOwnerId: string,
  allowRoles: Role[] = [Role.ADMIN]
): void {
  if (request.user.id === resourceOwnerId) {
    return;
  }

  if (allowRoles.includes(request.user.role)) {
    return;
  }

  throw new PermissionError('You can only access your own resources');
}

export function createRoleGuard(allowedRoles: Role[]) {
  return (request: AuthenticatedRequest): void => {
    requireRole(allowedRoles)(request);
  };
}

// Specific role guards
export const requireAdmin = createRoleGuard([Role.ADMIN]);
export const requireDoctor = createRoleGuard([Role.DOCTOR, Role.ADMIN]);
export const requirePatient = createRoleGuard([Role.PATIENT]);
export const requireDoctorOrPatient = createRoleGuard([Role.DOCTOR, Role.PATIENT]);
export const requireAnyRole = createRoleGuard([Role.ADMIN, Role.DOCTOR, Role.PATIENT]);