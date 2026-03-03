import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog, AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { PatientService } from '@/lib/services/patient.service';
import { patientQuerySchema } from '@/lib/validators/admin.validator';
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
      primaryDoctorId: searchParams.get('primaryDoctorId') || undefined,
      status: searchParams.get('status') as z.infer<typeof patientQuerySchema>['status'] || undefined,
    };

    const validatedParams = patientQuerySchema.parse(params);
    const result = await PatientService.getPatients(validatedParams);

    auditLog(
      request.user!.id,
      'LIST_PATIENTS',
      'Patient',
      undefined,
      { params: validatedParams }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing patients:', error);
    
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
