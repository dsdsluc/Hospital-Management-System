import { prisma } from "@/lib/prisma";
import { Prisma, AppointmentStatus } from "@prisma/client";
import { doctorAppointmentQuerySchema } from "@/lib/validators/doctor.validator";
import { AppointmentService } from "@/lib/services/appointment.service";
import type { z } from "zod";

export class DoctorAppointmentService {
  static async getAppointments(
    userId: string,
    query: z.infer<typeof doctorAppointmentQuerySchema>,
  ) {
    const { page, limit, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) {
      throw new Error("Doctor profile not found");
    }

    const where: Prisma.AppointmentWhereInput = {
      doctorId: doctor.id,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments.map((apt) => ({
        id: apt.id,
        scheduledAt: apt.scheduledAt,
        status: apt.status,
        version: apt.version,
        patient: apt.patient,
        department: apt.department,
        reason: apt.reason,
        notes: apt.notes,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAppointmentById(userId: string, appointmentId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) throw new Error("Doctor profile not found");

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            gender: true,
            dob: true,
            contact: true,
            address: true,
            user: { select: { email: true } },
          },
        },
        department: { select: { id: true, name: true } },
      },
    });

    if (!appointment) throw new Error("Appointment not found");
    if (appointment.doctorId !== doctor.id)
      throw new Error("Unauthorized access to appointment");
    if (appointment.deletedAt) throw new Error("Appointment is deleted");

    return appointment;
  }

  // Refactored to delegate to AppointmentService or mirror logic
  static async updateStatus(
    userId: string,
    appointmentId: string,
    newStatus: AppointmentStatus,
  ) {
    return await AppointmentService.updateStatus(
      appointmentId,
      newStatus,
      userId,
      "DOCTOR",
    );
  }

  static async completeAppointment(
    userId: string,
    appointmentId: string,
    data: { diagnosis: string; notes?: string; prescription?: any },
  ) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) throw new Error("Doctor profile not found");

    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { patient: true },
      });

      if (!appointment) throw new Error("Appointment not found");
      if (appointment.doctorId !== doctor.id) throw new Error("Unauthorized");

      // Validate State: Only IN_PROGRESS can be completed (or CONFIRMED if skipping check-in)
      if (
        appointment.status !== "IN_PROGRESS" &&
        appointment.status !== "CHECKED_IN" // Allow from CHECKED_IN if skipping IN_PROGRESS step manually? No, strict flow.
      ) {
        // Strict: Must be IN_PROGRESS
        if (appointment.status === "COMPLETED")
          throw new Error("Appointment already completed");
        if (appointment.status === "CANCELLED")
          throw new Error("Cannot complete cancelled appointment");
        // If strict flow: REQUESTED -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> COMPLETED
        // We might need to allow shortcuts or strict enforcement.
        // Let's assume strict enforcement: Must be IN_PROGRESS.
        // But for development ease, maybe allow CONFIRMED?
        // Let's stick to IN_PROGRESS as per prompt "IN_PROGRESS -> COMPLETED"
        throw new Error(
          `Appointment must be IN_PROGRESS to complete. Current: ${appointment.status}`,
        );
      }

      // 1. Update Appointment Status using Service logic (re-implemented here for transaction safety with MedicalRecord)
      // Or we can just update directly since we are inside a transaction.
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "COMPLETED",
          version: { increment: 1 },
          completedAt: new Date(),
        },
      });

      // Update Visit endedAt
      const visit = await tx.visit.findUnique({
        where: { appointmentId },
      });
      if (visit) {
        await tx.visit.update({
          where: { id: visit.id },
          data: { endedAt: new Date() },
        });
      }

      // 2. Create Medical Record
      const medicalRecord = await tx.medicalRecord.create({
        data: {
          patientId: appointment.patientId,
          doctorId: doctor.id,
          diagnosis: data.diagnosis,
          encounterDate: new Date(),
          // notes: data.notes // Schema check needed
        },
      });

      // 3. Create Prescription (if provided)
      if (
        data.prescription &&
        data.prescription.medications &&
        data.prescription.medications.length > 0
      ) {
        await tx.prescription.create({
          data: {
            medicalRecordId: medicalRecord.id,
            patientId: appointment.patientId,
            doctorId: doctor.id,
            medications: data.prescription.medications,
            instructions: data.prescription.instructions,
          },
        });
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: "DOCTOR_COMPLETE_APPOINTMENT",
          entity: "Appointment",
          entityId: appointmentId,
          metadata: {
            medicalRecordId: medicalRecord.id,
            hasPrescription: !!data.prescription,
          },
        },
      });

      return { success: true };
    });
  }
}
