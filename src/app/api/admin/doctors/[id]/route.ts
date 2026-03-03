import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog } from '@/lib/permissions/admin.permission';
import { DoctorService } from '@/lib/services/doctor.service';
import { updateDoctorSchema } from '@/lib/validators/admin.validator';
import type { AuthenticatedRequest } from '../route';

export async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = updateDoctorSchema.parse(body);

    const result = await DoctorService.updateDoctor(id, validatedData);

    auditLog(
      request.user!.id,
      'UPDATE_DOCTOR',
      'Doctor',
      id,
      { updatedFields: Object.keys(validatedData) }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating doctor:', error);
    
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
      { error: 'Failed to update doctor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const result = await DoctorService.getDoctorById(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting doctor:', error);
    
    if (error instanceof Error && error.message === 'Doctor not found') {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to get doctor' },
      { status: 500 }
    );
  }
}
