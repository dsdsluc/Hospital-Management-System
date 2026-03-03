import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog, AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { PatientService } from '@/lib/services/patient.service';
import { z } from 'zod';

const assignDoctorSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

export async function PATCH(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { doctorId } = assignDoctorSchema.parse(body);

    await PatientService.assignDoctor(id, doctorId);

    auditLog(
      request.user!.id,
      'ASSIGN_DOCTOR',
      'Patient',
      id,
      { doctorId }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning doctor:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to assign doctor' }, { status: 500 });
  }
}
