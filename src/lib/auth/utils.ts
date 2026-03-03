import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function getPatientIdFromUserId(userId: string): Promise<string> {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!patient) {
    throw new Error('Patient profile not found');
  }

  return patient.id;
}

export async function getDoctorIdFromUserId(userId: string): Promise<string> {
  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!doctor) {
    throw new Error('Doctor profile not found');
  }

  return doctor.id;
}

export async function getUserContext(userId: string, role: Role) {
  switch (role) {
    case Role.PATIENT:
      return {
        patientId: await getPatientIdFromUserId(userId),
        doctorId: null,
      };
    case Role.DOCTOR:
      return {
        patientId: null,
        doctorId: await getDoctorIdFromUserId(userId),
      };
    case Role.ADMIN:
      return {
        patientId: null,
        doctorId: null,
      };
    default:
      throw new Error('Invalid user role');
  }
}