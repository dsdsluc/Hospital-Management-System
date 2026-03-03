import { NextResponse } from 'next/server';
import { requireAdmin, auditLog } from '@/lib/permissions/admin.permission';
import { patientService } from '@/lib/services/patient.service';
import type { AuthenticatedRequest } from '@/lib/permissions/admin.permission';

export async function POST(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const result = await patientService.reconcileMissingPatients();

    auditLog(
      request.user!.id,
      'RECONCILE_PATIENTS',
      'Patient',
      undefined,
      { created: result.created }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reconcile patients' }, { status: 500 });
  }
}
