import { NextRequest, NextResponse } from "next/server";
import {
  requirePatient,
  auditLog,
  AuthenticatedRequest,
} from "@/lib/permissions/patient.permission";
import { PatientAppointmentService } from "@/lib/services/patient-appointment.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: AuthenticatedRequest,
  context: RouteContext,
) {
  const authError = await requirePatient(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    const appointment = await PatientAppointmentService.getAppointmentById(
      request.user!.id,
      id,
    );

    auditLog(request.user!.id, "PATIENT_VIEW_APPOINTMENT", "Appointment", id);

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error viewing appointment details:", error);

    if (error instanceof Error) {
      if (error.message === "Appointment not found") {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to retrieve appointment details" },
      { status: 500 },
    );
  }
}
