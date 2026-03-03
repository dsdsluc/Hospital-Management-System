import { NextResponse } from 'next/server';
import { requireAdmin, auditLog } from '@/lib/permissions/admin.permission';
import type { AuthenticatedRequest } from '@/lib/permissions/admin.permission';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { UserStatus } from '@prisma/client';
import crypto from 'crypto';

const ApproveDoctorSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  licenseNo: z.string().optional(),
});

export async function POST(
  request: AuthenticatedRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validated = ApproveDoctorSchema.parse(body);

    // Find the doctor and associated user
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    if (doctor.user.status === UserStatus.ACTIVE) {
      return NextResponse.json({ error: 'Doctor is already active' }, { status: 400 });
    }

    // Transaction to update doctor and user
    await prisma.$transaction(async (tx) => {
      // 1. Update Doctor Profile
      await tx.doctor.update({
        where: { id },
        data: {
          departmentId: validated.departmentId,
          specialization: validated.specialization,
          licenseNo: validated.licenseNo || `LIC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, // Generate if not provided
        },
      });

      // 2. Activate User
      await tx.user.update({
        where: { id: doctor.userId },
        data: {
          status: UserStatus.ACTIVE,
          emailVerified: new Date(), // Auto-verify email on admin approval
        },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          userId: request.user!.id,
          action: 'APPROVE_DOCTOR',
          entity: 'Doctor',
          entityId: id,
          metadata: {
            doctorName: doctor.name,
            assignedDepartment: validated.departmentId,
          },
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Doctor approved and activated' });
  } catch (error: any) {
    console.error('Error approving doctor:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to approve doctor' }, { status: 500 });
  }
}
