import { Doctor, DoctorSchedule } from "@prisma/client";
import { getJson, patchJson, putJson } from "@/lib/services/http";

export interface DoctorProfile extends Doctor {
  email: string;
  department: {
      id: string;
      name: string;
  } | null;
  schedules: DoctorSchedule[];
}

export async function getDoctorProfile() {
  return getJson<DoctorProfile>("/api/doctor/profile");
}

export async function updateDoctorProfile(data: { name: string; email: string; departmentId: string }) {
  return patchJson<DoctorProfile>("/api/doctor/profile", data);
}

export async function updateDoctorSchedule(data: { days: number[]; startTime: string; endTime: string }) {
  return putJson<DoctorSchedule[]>("/api/doctor/schedule", data);
}
