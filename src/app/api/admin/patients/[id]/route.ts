import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog, AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { PatientService } from '@/lib/services/patient.service';

export async function GET(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const result = await PatientService.getPatientById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting patient:', error);
    if (error instanceof Error && error.message === 'Patient not found') {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to get patient' }, { status: 500 });
  }
}

export async function DELETE(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    await PatientService.deletePatient(id);
    
    auditLog(
      request.user!.id,
      'DELETE_PATIENT',
      'Patient',
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    if (error instanceof Error && error.message === 'Patient not found') {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
