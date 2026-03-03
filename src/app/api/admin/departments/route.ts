import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, auditLog } from '@/lib/permissions/admin.permission';
import { departmentService, createDepartmentSchema } from '@/lib/services/department.service';
import { AuthenticatedRequest } from '@/lib/permissions/admin.permission';

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      search: searchParams.get('search') || undefined,
    };

    const result = await departmentService.listDepartments(params);

    auditLog(
      request.user!.id,
      'LIST_DEPARTMENTS',
      'Department'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing departments:', error);
    return NextResponse.json(
      { error: 'Failed to list departments' },
      { status: 500 }
    );
  }
}

export async function POST(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = createDepartmentSchema.parse(body);

    const result = await departmentService.createDepartment(validatedData);

    auditLog(
      request.user!.id,
      'CREATE_DEPARTMENT',
      'Department',
      result.id,
      { name: result.name }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}
