import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  AuthenticatedRequest,
} from "@/lib/permissions/admin.permission";
import { MedicalRecordService } from "@/lib/services/medical-record.service";
import { z } from "zod";

const createPrescriptionSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  medications: z
    .array(
      z.object({
        name: z.string().min(1, "Medication name is required"),
        dosage: z.string().min(1, "Dosage is required"),
        freq: z.string().min(1, "Frequency is required"),
        duration: z.string().min(1, "Duration is required"),
      }),
    )
    .min(1, "At least one medication is required"),
  instructions: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: AuthenticatedRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = createPrescriptionSchema.parse(body);

    const result = await MedicalRecordService.createPrescription({
      patientId: id,
      ...validatedData,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
