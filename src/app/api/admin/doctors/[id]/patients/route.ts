import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog, AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { PatientService } from '@/lib/services/patient.service';
import { patientQuerySchema } from '@/lib/validators/admin.validator';
import { z, ZodError } from 'zod';

export async function GET(request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // doctorId
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as z.infer<typeof patientQuerySchema>['status'] || undefined,
      primaryDoctorId: id // Force filtering by this doctor
    };

    const validatedParams = patientQuerySchema.parse(params);
    const result = await PatientService.getPatients(validatedParams);

    auditLog(
      request.user!.id,
      'LIST_DOCTOR_PATIENTS',
      'Doctor',
      id,
      { params: validatedParams }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing doctor patients:', error);
    
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
      { error: 'Failed to list patients' },
      { status: 500 }
    );
  }
}
