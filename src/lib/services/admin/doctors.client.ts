import { getJson } from "@/lib/services/http";

export interface DoctorListItem {
  id: string;
  name: string;
  specialization: string;
}

export interface DoctorListResponse {
  data: DoctorListItem[];
}

export async function getDoctors(limit = 100): Promise<DoctorListItem[]> {
  const res = await getJson<DoctorListResponse | DoctorListItem[]>(
    `/api/admin/doctors?limit=${limit}`,
  );
  return Array.isArray(res) ? res : res.data;
}
