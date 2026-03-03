import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { patientAppointmentQuerySchema } from "@/lib/validators/patient.validator";
import type { z } from "zod";

export class PatientAppointmentService {
  static async getAppointments(
    userId: string,
    query: z.infer<typeof patientAppointmentQuerySchema>,
  ) {
    const { page, limit, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    let patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      // Auto-create patient record if missing
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user) {
        patient = await prisma.patient.create({
          data: {
            userId,
            name: user.email.split("@")[0], // Fallback name
            // No need to manually connect user via nested write since we provided userId directly
          },
          select: { id: true },
        });
      } else {
        throw new Error("User not found");
      }
    }

    const where: Prisma.AppointmentWhereInput = {
      patientId: patient.id,
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
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
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
        doctor: apt.doctor,
        department: apt.department,
        reason: apt.reason,
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
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      throw new Error("Patient record not found");
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: patient.id,
        deletedAt: null,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            contact: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        visit: {
          select: {
            roomNumber: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    return appointment;
  }

  static async cancelAppointment(
    userId: string,
    appointmentId: string,
    reason?: string,
  ) {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      throw new Error("Patient record not found");
    }

    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findFirst({
        where: {
          id: appointmentId,
          patientId: patient.id,
          deletedAt: null,
        },
      });

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // Allow cancelling REQUESTED or CONFIRMED appointments
      if (!["REQUESTED", "CONFIRMED"].includes(appointment.status)) {
        throw new Error(
          "Only REQUESTED or CONFIRMED appointments can be cancelled",
        );
      }

      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "CANCELLED",
          reason: reason || "Cancelled by patient",
          version: { increment: 1 },
          cancelledAt: new Date(),
          cancelledById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "PATIENT_CANCEL_APPOINTMENT",
          entity: "Appointment",
          entityId: appointmentId,
          metadata: {
            oldStatus: appointment.status,
            newStatus: "CANCELLED",
            reason,
          },
        },
      });

      return updatedAppointment;
    });
  }
}
