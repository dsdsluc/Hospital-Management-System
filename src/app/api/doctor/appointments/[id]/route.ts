import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctor,
  AuthenticatedRequest,
} from "@/lib/permissions/doctor.permission";
import { DoctorAppointmentService } from "@/lib/services/doctor-appointment.service";

export async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authError = await requireDoctor(request);
  if (authError) return authError;

  try {
    const result = await DoctorAppointmentService.getAppointmentById(
      request.user!.id,
      id,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    if (error instanceof Error) {
      if (error.message === "Appointment not found") {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 },
        );
      }
      if (error.message === "Unauthorized access to appointment") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 },
    );
  }
}
