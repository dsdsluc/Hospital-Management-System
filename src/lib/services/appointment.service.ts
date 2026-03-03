import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { appointmentQuerySchema } from "@/lib/validators/admin.validator";

// --- State Machine ---
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.REQUESTED]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.CHECKED_IN]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
  [AppointmentStatus.RESCHEDULED]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
  ],
};

// --- Interfaces ---
interface CreateAppointmentDTO {
  userId: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledAt: Date;
  notes?: string;
}

// --- Service ---
export class AppointmentService {
  // 1. Validate Status Transition
  static validateTransition(
    current: AppointmentStatus,
    next: AppointmentStatus,
  ): boolean {
    if (current === next) return true;
    return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
  }

  // 2. Validate Doctor Schedule
  static async validateSchedule(doctorId: string, date: Date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const timeString = date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // Check if doctor has a schedule for this day
    // @ts-ignore
    if (!prisma.doctorSchedule) {
      throw new Error(
        "Prisma Client is outdated. Please restart the development server to load the new schema.",
      );
    }

    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      throw new Error("Doctor is not available on this day");
    }

    // Simple string comparison for HH:mm (works because 24h format is sortable)
    if (timeString < schedule.startTime || timeString > schedule.endTime) {
      throw new Error(
        `Doctor is only available between ${schedule.startTime} and ${schedule.endTime}`,
      );
    }
  }

  // 3. Check Conflicts
  static async checkConflicts(
    doctorId: string,
    patientId: string,
    scheduledAt: Date,
  ) {
    // Check Doctor Conflict
    const doctorConflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        scheduledAt,
        status: { in: ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"] },
        deletedAt: null,
      },
    });

    if (doctorConflict) {
      throw new Error("Doctor is already booked at this time");
    }

    // Check Patient Conflict
    const patientConflict = await prisma.appointment.findFirst({
      where: {
        patientId,
        scheduledAt,
        status: { in: ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"] },
        deletedAt: null,
      },
    });

    if (patientConflict) {
      throw new Error("Patient already has an appointment at this time");
    }
  }

  // 4. Create Appointment (Booking)
  static async createAppointment(data: CreateAppointmentDTO) {
    // a. Validate Doctor & Schedule
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
      include: { user: { select: { status: true } } },
    });

    if (!doctor || doctor.user.status !== "ACTIVE") {
      throw new Error("Doctor is not available");
    }

    // b. Validate Schedule & Conflicts
    await this.validateSchedule(data.doctorId, data.scheduledAt);
    await this.checkConflicts(data.doctorId, data.patientId, data.scheduledAt);

    console.log("Creating appointment with:", {
      userId: data.userId,
      patientId: data.patientId,
    });

    // c. Transaction: Create & Auto-Confirm (Option A per prompt)
    return await prisma.$transaction(async (tx) => {
      // Create as REQUESTED
      const appointment = await tx.appointment.create({
        data: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          departmentId: data.departmentId,
          scheduledAt: data.scheduledAt,
          status: "REQUESTED",
          notes: data.notes,
        },
      });

      // Immediate transition to CONFIRMED (Clinical Workflow Option A)
      const confirmedAppointment = await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "CONFIRMED",
          version: { increment: 1 },
        },
        include: {
          doctor: { select: { name: true } },
          department: { select: { name: true } },
        },
      });

      // Audit
      await tx.auditLog.create({
        data: {
          userId: data.userId,
          action: "PATIENT_BOOK_APPOINTMENT",
          entity: "Appointment",
          entityId: appointment.id,
          metadata: {
            status: "CONFIRMED",
            scheduledAt: data.scheduledAt,
          },
        },
      });

      return confirmedAppointment;
    });
  }

  // 5. Update Status (The core workflow engine)
  static async updateStatus(
    appointmentId: string,
    newStatus: AppointmentStatus,
    actorId: string,
    actorRole: "ADMIN" | "DOCTOR" | "PATIENT",
    reason?: string,
    expectedVersion?: number,
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { visit: true },
    });

    if (!appointment) throw new Error("Appointment not found");

    // Optimistic Concurrency Control
    if (
      expectedVersion !== undefined &&
      appointment.version !== expectedVersion
    ) {
      throw new Error(
        "Version mismatch. The appointment has been updated by someone else.",
      );
    }

    // a. Validate Transition
    if (
      actorRole !== "ADMIN" &&
      !this.validateTransition(appointment.status, newStatus)
    ) {
      // Admins can force transitions if needed, but usually should follow rules too.
      // For now, let's enforce rules for everyone unless strictly required otherwise.
      throw new Error(
        `Invalid transition from ${appointment.status} to ${newStatus}`,
      );
    }
    // Still validate for Admin for sanity, unless it's a "Reset"
    if (
      actorRole === "ADMIN" &&
      !this.validateTransition(appointment.status, newStatus)
    ) {
      // Allow Admin to cancel from anywhere?
      if (newStatus !== "CANCELLED") {
        throw new Error(
          `Invalid transition from ${appointment.status} to ${newStatus}`,
        );
      }
    }

    // b. Role-based Permission Checks
    if (actorRole === "PATIENT") {
      if (newStatus !== "CANCELLED")
        throw new Error("Patients can only cancel appointments");
      if (!["REQUESTED", "CONFIRMED"].includes(appointment.status)) {
        throw new Error("Cannot cancel appointment at this stage");
      }
    }

    if (actorRole === "DOCTOR") {
      if (newStatus === "IN_PROGRESS" && appointment.status !== "CHECKED_IN") {
        // Strict flow enforcement
      }
    }

    // c. Prepare Update Data
    const updateData: Prisma.AppointmentUpdateInput = {
      status: newStatus,
      version: { increment: 1 },
    };

    if (newStatus === "CHECKED_IN") updateData.checkedInAt = new Date();
    if (newStatus === "IN_PROGRESS") updateData.startedAt = new Date();
    if (newStatus === "COMPLETED") updateData.completedAt = new Date();
    if (newStatus === "CANCELLED") {
      updateData.cancelledAt = new Date();
      updateData.cancelledById = actorId;
      updateData.cancellationReason = reason;
    }

    // d. Transaction
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: updateData,
      });

      // Side Effects
      if (newStatus === "IN_PROGRESS") {
        // Create Visit
        await tx.visit.create({
          data: {
            appointmentId: appointment.id,
            startedAt: new Date(),
          },
        });
      } else if (newStatus === "COMPLETED") {
        // Update Visit
        if (appointment.visit) {
          await tx.visit.update({
            where: { id: appointment.visit.id },
            data: { endedAt: new Date() },
          });
        }
      }

      // Audit
      await tx.auditLog.create({
        data: {
          userId: actorId,
          action: "APPOINTMENT_STATUS_CHANGE",
          entity: "Appointment",
          entityId: appointmentId,
          metadata: {
            oldStatus: appointment.status,
            newStatus: newStatus,
            reason,
            role: actorRole,
          },
        },
      });

      return updated;
    });
  }

  // 6. Get Appointments (Admin/General)
  static async getAppointments(
    query: z.infer<typeof appointmentQuerySchema> & { search?: string },
  ) {
    const {
      page,
      limit,
      startDate,
      endDate,
      departmentId,
      status,
      doctorId,
      patientId,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { patient: { name: { contains: search, mode: "insensitive" } } },
        { doctor: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: { id: true, name: true, user: { select: { email: true } } },
          },
          doctor: {
            select: { id: true, name: true, specialization: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments.map((apt) => ({
        id: apt.id,
        scheduledAt: apt.scheduledAt,
        status: apt.status,
        version: apt.version,
        reason: apt.reason,
        notes: apt.notes,
        createdAt: apt.createdAt,
        patient: {
          id: apt.patient.id,
          name: apt.patient.name,
          email: apt.patient.user.email,
        },
        doctor: {
          id: apt.doctor.id,
          name: apt.doctor.name,
          specialization: apt.doctor.specialization,
        },
        department: {
          id: apt.department.id,
          name: apt.department.name,
        },
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 7. Reassign Doctor
  static async reassignDoctor(
    appointmentId: string,
    newDoctorId: string,
    expectedVersion: number,
    adminId: string,
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true },
    });

    if (!appointment) throw new Error("Appointment not found");

    if (appointment.version !== expectedVersion) {
      throw new Error(
        "Version mismatch. The appointment has been updated by someone else.",
      );
    }

    // Only allow reassignment for future appointments (REQUESTED, CONFIRMED, RESCHEDULED)
    if (
      !["REQUESTED", "CONFIRMED", "RESCHEDULED"].includes(appointment.status)
    ) {
      throw new Error(
        "Cannot reassign doctor for ongoing or completed appointments",
      );
    }

    // Validate new doctor availability
    const newDoctor = await prisma.doctor.findUnique({
      where: { id: newDoctorId },
      include: { user: true },
    });

    if (!newDoctor || newDoctor.user.status !== "ACTIVE") {
      throw new Error("New doctor is not active or found");
    }

    // Check conflicts for new doctor
    await this.validateSchedule(newDoctorId, appointment.scheduledAt);
    await this.checkConflicts(
      newDoctorId,
      appointment.patientId,
      appointment.scheduledAt,
    );

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          doctorId: newDoctorId,
          version: { increment: 1 },
        },
        include: { doctor: true },
      });

      // Audit
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "APPOINTMENT_REASSIGNED",
          entity: "Appointment",
          entityId: appointmentId,
          metadata: {
            oldDoctorId: appointment.doctorId,
            newDoctorId: newDoctorId,
            scheduledAt: appointment.scheduledAt,
          },
        },
      });

      return updated;
    });
  }

  // 8. Get Appointment Details (Admin)
  static async getAppointmentDetails(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            contact: true,
            gender: true,
            dob: true,
            user: { select: { email: true } },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            department: { select: { name: true } },
          },
        },
        department: true,
        visit: true,
      },
    });

    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  }
}
