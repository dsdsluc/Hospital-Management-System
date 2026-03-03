import { NextResponse } from "next/server";
import { requireAdmin, auditLog } from "@/lib/permissions/admin.permission";
import { departmentService } from "@/lib/services/department.service";
import type { AuthenticatedRequest } from "@/lib/permissions/admin.permission";
import { z } from "zod";

const assignHeadSchema = z.object({
  doctorId: z.string().cuid().optional().nullable(),
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
    const { doctorId } = assignHeadSchema.parse(body);

    const result = await departmentService.assignHeadDoctor(
      id,
      doctorId ?? null,
    );

    auditLog(request.user!.id, "ASSIGN_HEAD_DOCTOR", "Department", id, {
      doctorId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to assign head doctor" },
      { status: 500 },
    );
  }
}
