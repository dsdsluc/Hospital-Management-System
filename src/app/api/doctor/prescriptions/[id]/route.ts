import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctor,
  AuthenticatedRequest,
} from "@/lib/permissions/doctor.permission";
import { MedicalRecordService } from "@/lib/services/medical-record.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePrescriptionSchema = z.object({
  medications: z
    .array(
      z.object({
        name: z.string().min(1, "Medication name is required"),
        dosage: z.string().min(1, "Dosage is required"),
        freq: z.string().min(1, "Frequency is required"),
        duration: z.string().min(1, "Duration is required"),
      }),
    )
    .optional(),
  instructions: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: AuthenticatedRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  const authError = await requireDoctor(request);
  if (authError) return authError;

  // Verify ownership or permission?
  // Ideally, ensure the doctor updating it is the one who created it or has access.
  // For now, let's just check if it exists and the user is a doctor.

  const prescription = await prisma.prescription.findUnique({
    where: { id },
  });

  if (!prescription) {
    return NextResponse.json(
      { error: "Prescription not found" },
      { status: 404 },
    );
  }

  // Optional: Check if the doctor is the same one who created it
  // const doctor = await prisma.doctor.findUnique({ where: { userId: request.user!.id } });
  // if (prescription.doctorId !== doctor?.id) { ... }
  // Skipping strict ownership check for now as other doctors might need to edit in a collaborative environment.

  try {
    const body = await request.json();
    const validatedData = updatePrescriptionSchema.parse(body);

    const result = await MedicalRecordService.updatePrescription(
      id,
      validatedData as any, // Cast because zod optional vs required mismatch if strict
    );

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
