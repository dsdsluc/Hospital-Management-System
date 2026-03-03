import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  AuthenticatedRequest,
} from "@/lib/permissions/admin.permission";
import { DoctorService } from "@/lib/services/doctor.service";
import { updateUserStatusSchema } from "@/lib/validators/admin.validator";
import { z } from "zod";

export async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = updateUserStatusSchema.parse(body);

    // Call service to handle logic, validation, and audit logging
    await DoctorService.updateDoctorStatus(
      id,
      validatedData.status,
      request.user!.id,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating doctor status:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      if (error.message === "Doctor not found") {
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 },
        );
      }
      if (error.message.includes("Invalid status transition")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update doctor status" },
      { status: 500 },
    );
  }
}
