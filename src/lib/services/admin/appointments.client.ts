import { getJson, patchJson } from '@/lib/services/http'
import type { AppointmentListResponse, AppointmentStatus } from '@/types/appointments'

export async function getAppointments(query: URLSearchParams): Promise<AppointmentListResponse> {
  const url = `/api/admin/appointments?${query.toString()}`
  return await getJson<AppointmentListResponse>(url)
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<{ success?: boolean }> {
  return await patchJson<{ success?: boolean }>(`/api/admin/appointments/${id}/status`, { status })
}

