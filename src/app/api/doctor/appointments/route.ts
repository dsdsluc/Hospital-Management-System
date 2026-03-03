import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctor,
  auditLog,
  AuthenticatedRequest,
} from "@/lib/permissions/doctor.permission";
import { DoctorAppointmentService } from "@/lib/services/doctor-appointment.service";
import { doctorAppointmentQuerySchema } from "@/lib/validators/doctor.validator";
import { z, ZodError } from "zod";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireDoctor(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
      status: (searchParams.get("status") as any) || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const validatedParams = doctorAppointmentQuerySchema.parse(params);
    const result = await DoctorAppointmentService.getAppointments(
      request.user!.id,
      validatedParams,
    );

    auditLog(
      request.user!.id,
      "DOCTOR_LIST_APPOINTMENTS",
      "Appointment",
      undefined,
      { params: validatedParams },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing doctor appointments:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to list appointments" },
      { status: 500 },
    );
  }
}
