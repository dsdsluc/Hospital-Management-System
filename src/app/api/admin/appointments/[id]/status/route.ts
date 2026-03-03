import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  AuthenticatedRequest,
} from "@/lib/permissions/admin.permission";
import { AppointmentService } from "@/lib/services/appointment.service";
import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "CONFIRMED",
    "CHECKED_IN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "RESCHEDULED",
    "NO_SHOW",
  ]),
  version: z.number(),
  reason: z.string().optional(),
});

export async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { status, version, reason } = updateStatusSchema.parse(body);

    const result = await AppointmentService.updateStatus(
      id,
      status as AppointmentStatus,
      request.user!.id,
      "ADMIN",
      reason,
      version,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating appointment status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("Version mismatch")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes("Invalid status transition")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to update appointment status" },
      { status: 500 },
    );
  }
}
