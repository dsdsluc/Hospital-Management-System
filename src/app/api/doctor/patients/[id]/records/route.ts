import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctor,
  AuthenticatedRequest,
} from "@/lib/permissions/doctor.permission";
import { MedicalRecordService } from "@/lib/services/medical-record.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRecordSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  allergies: z.string().optional(),
  vitals: z.record(z.any()).optional(),
  filesRef: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: AuthenticatedRequest,
  context: RouteContext,
) {
  const { id } = await context.params;
  const authError = await requireDoctor(request);
  if (authError) return authError;

  // Get Doctor ID from current user
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
    const body = await request.json();
    const validatedData = createRecordSchema.parse(body);

    const result = await MedicalRecordService.createMedicalRecord({
      patientId: id,
      doctorId: doctor.id,
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
