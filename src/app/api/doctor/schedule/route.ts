import { NextResponse } from "next/server";
import { DoctorService } from "@/lib/services/doctor.service";
import { requireDoctor, AuthenticatedRequest } from "@/lib/permissions/doctor.permission";

export async function PUT(req: AuthenticatedRequest) {
  const authError = await requireDoctor(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const updatedSchedule = await DoctorService.updateDoctorAvailabilityByUserId(req.user!.id, body);
    return NextResponse.json(updatedSchedule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
