import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctor,
  AuthenticatedRequest,
} from "@/lib/permissions/doctor.permission";
import { PatientService } from "@/lib/services/patient.service";
import { prisma } from "@/lib/prisma";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireDoctor(request);
  if (authError) return authError;

  const search = request.nextUrl.searchParams.get("search") || undefined;

  // Find Doctor ID from User ID
  const doctor = await prisma.doctor.findUnique({
    where: { userId: request.user!.id },
  });

  if (!doctor) {
    return NextResponse.json(
      { error: "Doctor profile not found" },
      { status: 404 },
    );
  }

  try {
    const result = await PatientService.getPatientsByDoctor(doctor.id, {
      search,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
