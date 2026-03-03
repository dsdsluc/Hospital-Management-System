import { NextRequest, NextResponse } from "next/server";
import {
  requireDoctor,
  AuthenticatedRequest,
} from "@/lib/permissions/doctor.permission";
import { MedicalRecordService } from "@/lib/services/medical-record.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTestResultSchema = z.object({
  type: z.string().optional(),
  resultSummary: z.string().optional(),
  reportedAt: z.string().optional(),
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

  const testResult = await prisma.testResult.findUnique({
    where: { id },
  });

  if (!testResult) {
    return NextResponse.json(
      { error: "Test result not found" },
      { status: 404 },
    );
  }

  try {
    const body = await request.json();
    const validatedData = updateTestResultSchema.parse(body);

    const result = await MedicalRecordService.updateTestResult(id, {
      type: validatedData.type,
      resultSummary: validatedData.resultSummary,
      reportedAt: validatedData.reportedAt
        ? new Date(validatedData.reportedAt)
        : undefined,
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
