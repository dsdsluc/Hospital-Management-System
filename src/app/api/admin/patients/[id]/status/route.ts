import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog, AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { PatientService } from '@/lib/services/patient.service';
import { updateUserStatusSchema } from '@/lib/validators/admin.validator';
import { z } from 'zod';

export async function PATCH(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { status } = updateUserStatusSchema.parse(body);

    await PatientService.updatePatientStatus(id, status);

    auditLog(
      request.user!.id,
      'UPDATE_PATIENT_STATUS',
      'Patient',
      id,
      { status }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating patient status:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
