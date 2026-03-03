import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog } from '@/lib/permissions/admin.permission';
import { DoctorService } from '@/lib/services/doctor.service';
import { createDoctorSchema, doctorQuerySchema } from '@/lib/validators/admin.validator';
import { z, ZodError } from 'zod';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      search: searchParams.get('search') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      status: searchParams.get('status') as z.infer<typeof doctorQuerySchema>['status'] || undefined,
    };

    const validatedParams = doctorQuerySchema.parse(params);
    const result = await DoctorService.getDoctors(validatedParams);

    auditLog(
      request.user!.id,
      'LIST_DOCTORS',
      'Doctor',
      undefined,
      { params: validatedParams }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing doctors:', error);
    
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
      { error: 'Failed to list doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = createDoctorSchema.parse(body);

    const result = await DoctorService.createDoctor(validatedData);

    auditLog(
      request.user!.id,
      'CREATE_DOCTOR',
      'Doctor',
      result.id,
      { email: result.email, name: result.name }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor:', error);
    
    if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.issues },
          { status: 400 }
        );
    }

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email or license number already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}
