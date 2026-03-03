import { getJson, patchJson, postJson } from "@/lib/services/http";
import { Gender } from "@prisma/client";

export interface PatientProfile {
  role: "PATIENT";
  user: {
    email: string;
    status: string;
    createdAt: string;
  };
  profile: {
    name: string;
    dob: string | null;
    gender: Gender | null;
    contact: string | null;
    address: string | null;
    emergencyContact: string | null;
  };
}

export interface UpdatePatientProfileInput {
  name?: string;
  dob?: string | null;
  gender?: Gender | null;
  contact?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  email?: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export async function getPatientProfile() {
  return getJson<PatientProfile>("/api/profile");
}

export async function updatePatientProfile(data: UpdatePatientProfileInput) {
  return patchJson<{ success: boolean }>("/api/profile", data);
}

export async function changePassword(data: ChangePasswordInput) {
  return postJson<{ success: boolean }>("/api/profile/password", data);
}
