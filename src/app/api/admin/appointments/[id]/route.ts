import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  AuthenticatedRequest,
} from "@/lib/permissions/admin.permission";
import { AppointmentService } from "@/lib/services/appointment.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: AuthenticatedRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const appointment = await AppointmentService.getAppointmentDetails(id);
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    if (error instanceof Error && error.message === "Appointment not found") {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch appointment details" },
      { status: 500 },
    );
  }
}
