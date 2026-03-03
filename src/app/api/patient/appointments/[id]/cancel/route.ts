import { NextRequest, NextResponse } from 'next/server';
import { requirePatient, auditLog, AuthenticatedRequest } from '@/lib/permissions/patient.permission';
import { PatientAppointmentService } from '@/lib/services/patient-appointment.service';
import { z } from 'zod';

const cancelSchema = z.object({
  reason: z.string().optional()
});

export async function PATCH(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authError = await requirePatient(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { reason } = cancelSchema.parse(body);

    const result = await PatientAppointmentService.cancelAppointment(
      request.user!.id,
      id,
      reason
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Only booked appointments')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
