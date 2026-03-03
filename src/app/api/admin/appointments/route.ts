import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog, AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { AppointmentService } from '@/lib/services/appointment.service';
import { appointmentQuerySchema } from '@/lib/validators/admin.validator';
import { z, ZodError } from 'zod';

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      status: searchParams.get('status') as any || undefined,
      doctorId: searchParams.get('doctorId') || undefined,
      patientId: searchParams.get('patientId') || undefined,
    };

    const validatedParams = appointmentQuerySchema.parse(params);
    const result = await AppointmentService.getAppointments(validatedParams);

    auditLog(
      request.user!.id,
      'LIST_APPOINTMENTS',
      'Appointment',
      undefined,
      { params: validatedParams }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing appointments:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(
      { error: 'Failed to list appointments' },
      { status: 500 }
    );
  }
}
