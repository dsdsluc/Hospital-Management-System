import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin, auditLog } from '@/lib/permissions/admin.permission';
import { departmentService, updateDepartmentSchema } from '@/lib/services/department.service';
import type { AuthenticatedRequest } from '@/lib/permissions/admin.permission';

export async function PATCH(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = updateDepartmentSchema.parse(body);

    const result = await departmentService.updateDepartment(id, validatedData);

    auditLog(
      request.user!.id,
      'UPDATE_DEPARTMENT',
      'Department',
      id,
      { updates: validatedData }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating department:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    await departmentService.deleteDepartment(id);

    auditLog(
      request.user!.id,
      'DELETE_DEPARTMENT',
      'Department',
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete department' },
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
    const result = await departmentService.getDepartmentDetails(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Department not found') {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to get department details' }, { status: 500 });
  }
}
