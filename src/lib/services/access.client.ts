import { getJson, patchJson } from "@/lib/services/http";

export type Role = "ADMIN" | "DOCTOR" | "PATIENT";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | "PENDING_APPROVAL";

export interface UserAccess {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  name: string;
}

export interface AccessFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
}

export async function getUsers(filters: AccessFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.role) params.append("role", filters.role);
  if (filters.status) params.append("status", filters.status);

  return getJson<{ data: UserAccess[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/admin/access?${params.toString()}`);
}

export async function updateUserAccess(id: string, data: { status?: UserStatus; role?: Role }) {
  return patchJson<{ data: UserAccess }>(`/api/admin/access/${id}`, data);
}
