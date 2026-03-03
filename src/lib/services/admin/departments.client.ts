import { getJson, patchJson, postJson } from "@/lib/services/http";
import type { DepartmentListItem, DepartmentListResponse } from "@/types/departments";

export async function getDepartments(params?: URLSearchParams): Promise<DepartmentListResponse> {
  const url = `/api/admin/departments${params ? `?${params.toString()}` : ""}`;
  return await getJson<DepartmentListResponse>(url);
}

export async function getDepartment(id: string): Promise<{
  id: string;
  name: string;
  description: string | null;
  headDoctor: { id: string; name: string; specialization: string } | null;
  members: { id: string; name: string; specialization: string; status: string }[];
  memberCount: number;
  appointmentCount: number;
  stats: {
    totalDoctors: number;
    activeDoctors: number;
    totalAppointments: number;
    upcomingAppointments: number;
    totalPatientsServed: number;
    headDoctor: { id: string; name: string; specialization: string } | null;
  };
}> {
  return await getJson(`/api/admin/departments/${id}`);
}

export async function createDepartment(body: { name: string; description?: string }): Promise<DepartmentListItem> {
  return (await postJson(`/api/admin/departments`, { name: body.name, description: body.description ?? null })) as unknown as DepartmentListItem;
}

export async function updateDepartment(id: string, body: { name?: string; description?: string }): Promise<DepartmentListItem> {
  return (await patchJson(`/api/admin/departments/${id}`, body)) as unknown as DepartmentListItem;
}

export async function deleteDepartment(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/admin/departments/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return await res.json();
}

export async function assignHeadDoctor(departmentId: string, doctorId: string | null): Promise<DepartmentListItem> {
  return (await patchJson(`/api/admin/departments/${departmentId}/assign-head`, { doctorId })) as unknown as DepartmentListItem;
}
