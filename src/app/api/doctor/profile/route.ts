import { NextResponse } from "next/server";
import { DoctorService } from "@/lib/services/doctor.service";
import { requireDoctor, AuthenticatedRequest } from "@/lib/permissions/doctor.permission";

export async function GET(req: AuthenticatedRequest) {
  const authError = await requireDoctor(req);
  if (authError) return authError;

  try {
    const profile = await DoctorService.getDoctorProfileByUserId(req.user!.id);
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: AuthenticatedRequest) {
  const authError = await requireDoctor(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const updatedProfile = await DoctorService.updateDoctorProfileByUserId(req.user!.id, body);
    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
