import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctor,
  AuthenticatedRequest,
} from "@/lib/permissions/doctor.permission";
import { AppointmentService } from "@/lib/services/appointment.service";
import { DoctorAppointmentService } from "@/lib/services/doctor-appointment.service";
import {
  updateAppointmentStatusSchema,
  completeAppointmentSchema,
} from "@/lib/validators/doctor.validator";
import { z, ZodError } from "zod";
import { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authError = await requireDoctor(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const userId = request.user!.id;

    // Check if it's a status update or completion
    if (body.status === "COMPLETED") {
      const validatedData = completeAppointmentSchema.parse(body);

      // 1. Use DoctorAppointmentService.completeAppointment for transactional safety
      const result = await DoctorAppointmentService.completeAppointment(
        userId,
        id,
        {
          diagnosis: validatedData.diagnosis,
          notes: validatedData.notes,
          // Add prescription if passed in body
          // prescription: body.prescription
        },
      );

      return NextResponse.json({ success: true, data: result });
    } else {
      const { status } = updateAppointmentStatusSchema.parse(body);

      // Validate that the status is a valid enum value
      if (
        !Object.values(AppointmentStatus).includes(status as AppointmentStatus)
      ) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const result = await AppointmentService.updateStatus(
        id,
        status as AppointmentStatus,
        userId,
        "DOCTOR",
      );
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error updating appointment:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Invalid transition") ||
        error.message.includes("Cannot cancel")
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message === "Appointment not found") {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    );
  }
}
