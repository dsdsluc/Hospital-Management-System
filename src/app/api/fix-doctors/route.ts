
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Find all users with role DOCTOR
    const doctorUsers = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      include: { doctorProfile: true }
    });

    const results = [];

    for (const user of doctorUsers) {
      let status = 'ok';
      let action = 'none';
      let details = null;

      if (!user.doctorProfile) {
        // Case 1: Missing Doctor Profile
        try {
          const newDoctor = await prisma.doctor.create({
            data: {
              userId: user.id,
              name: `Dr. ${user.email.split('@')[0]}`, // Default name from email
              specialization: 'General',
              licenseNo: `DOC-${user.id.substring(0, 8).toUpperCase()}`,
            }
          });
          status = 'fixed';
          action = 'created_profile';
          details = newDoctor;
        } catch (e: any) {
          status = 'error';
          details = e.message;
        }
      } else if (user.doctorProfile.deletedAt) {
        // Case 2: Soft-deleted Doctor Profile
        try {
          const restoredDoctor = await prisma.doctor.update({
            where: { id: user.doctorProfile.id },
            data: { deletedAt: null }
          });
          status = 'fixed';
          action = 'restored_profile';
          details = restoredDoctor;
        } catch (e: any) {
          status = 'error';
          details = e.message;
        }
      }

      results.push({
        email: user.email,
        userId: user.id,
        userStatus: user.status,
        doctorProfileExists: !!user.doctorProfile,
        doctorDeletedAt: user.doctorProfile?.deletedAt,
        status,
        action,
        details
      });
    }

    return NextResponse.json({
      message: 'Doctor consistency check completed',
      total_users_checked: doctorUsers.length,
      results
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
