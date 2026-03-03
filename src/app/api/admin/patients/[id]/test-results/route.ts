import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  AuthenticatedRequest,
} from "@/lib/permissions/admin.permission";
import { MedicalRecordService } from "@/lib/services/medical-record.service";
import { z } from "zod";

const createTestResultSchema = z.object({
  orderedByDoctorId: z.string().min(1, "Doctor ID is required"),
  type: z.string().min(1, "Test type is required"),
  resultSummary: z.string().min(1, "Result summary is required"),
  reportedAt: z.string().optional(),
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
    const validatedData = createTestResultSchema.parse(body);

    const result = await MedicalRecordService.createTestResult({
      patientId: id,
      orderedByDoctorId: validatedData.orderedByDoctorId,
      type: validatedData.type,
      resultSummary: validatedData.resultSummary,
      reportedAt: validatedData.reportedAt
        ? new Date(validatedData.reportedAt)
        : new Date(),
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
