import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog } from '@/lib/permissions/admin.permission';
import { DoctorService } from '@/lib/services/doctor.service';
import type { AuthenticatedRequest } from '../../route';

export async function DELETE(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    await DoctorService.deleteDoctor(id);

    auditLog(
      request.user!.id,
      'DELETE_DOCTOR',
      'Doctor',
      id,
      undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Doctor not found') {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
}
