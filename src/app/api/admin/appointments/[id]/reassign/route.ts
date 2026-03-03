import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { AppointmentService } from '@/lib/services/appointment.service';
import { z } from 'zod';

const reassignDoctorSchema = z.object({
  doctorId: z.string(),
  version: z.number()
});

export async function PATCH(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { doctorId, version } = reassignDoctorSchema.parse(body);

    const result = await AppointmentService.reassignDoctor(
      id,
      doctorId,
      version,
      request.user!.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reassigning doctor:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Version mismatch')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reassign doctor' },
      { status: 500 }
    );
  }
}
