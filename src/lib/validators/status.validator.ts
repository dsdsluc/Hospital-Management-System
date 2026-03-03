import { UserStatus } from '@prisma/client';

export const allowedTransitions: Record<UserStatus, UserStatus[]> = {
  [UserStatus.PENDING_APPROVAL]: [UserStatus.ACTIVE, UserStatus.DEACTIVATED],
  [UserStatus.ACTIVE]: [UserStatus.SUSPENDED, UserStatus.DEACTIVATED],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.DEACTIVATED],
  [UserStatus.DEACTIVATED]: [], // Immutable end state
};

export function validateStatusTransition(currentStatus: UserStatus, newStatus: UserStatus): boolean {
  // Allow same status (idempotent)
  if (currentStatus === newStatus) return true;
  
  const allowed = allowedTransitions[currentStatus] || [];
  return allowed.includes(newStatus);
}
