import { prisma } from "@/lib/prisma";
import { Prisma, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorQuerySchema,
} from "@/lib/validators/admin.validator";
import { validateStatusTransition } from "@/lib/validators/status.validator";
import type { z } from "zod";

export class DoctorService {
  static async getDoctors(query: z.infer<typeof doctorQuerySchema>) {
    const { page, limit, search, departmentId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {
      deletedAt: null, // Only active records
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.user = { status };
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, status: true, createdAt: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
        orderBy: { user: { createdAt: "desc" } },
      }),
      prisma.doctor.count({ where }),
    ]);

    console.log(`DoctorService.getDoctors found ${doctors.length} doctors, total count: ${total}`);

    return {
      data: doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        email: doctor.user.email,
        specialization: doctor.specialization,
        department: doctor.department,
        status: doctor.user.status,
        createdAt: doctor.user.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createDoctor(data: z.infer<typeof createDoctorSchema>) {
    const { email, name, specialization, departmentId, licenseNumber } = data;

    const hashedPassword = await bcrypt.hash("TempPassword123!", 10);

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: "DOCTOR",
          status: "PENDING_APPROVAL", // Default status
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          name,
          specialization,
          departmentId,
          licenseNo: licenseNumber,
        },
        include: {
          user: {
            select: { id: true, email: true, status: true, createdAt: true },
          },
          department: { select: { id: true, name: true } },
        },
      });

      return {
        id: doctor.id,
        name: doctor.name,
        email: doctor.user.email,
        specialization: doctor.specialization,
        department: doctor.department,
        status: doctor.user.status,
        createdAt: doctor.user.createdAt,
      };
    });
  }

  static async updateDoctor(
    id: string,
    data: z.infer<typeof updateDoctorSchema>,
  ) {
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: data.name,
        specialization: data.specialization,
        departmentId: data.departmentId,
        licenseNo: data.licenseNumber,
      },
      include: {
        user: {
          select: { id: true, email: true, status: true, createdAt: true },
        },
        department: { select: { id: true, name: true } },
      },
    });

    return {
      id: doctor.id,
      name: doctor.name,
      email: doctor.user.email,
      specialization: doctor.specialization,
      department: doctor.department,
      status: doctor.user.status,
      createdAt: doctor.user.createdAt,
    };
  }

  static async updateDoctorStatus(
    id: string,
    newStatus: UserStatus,
    adminId: string,
    reason?: string,
  ) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { userId: true, user: { select: { status: true } } },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const currentStatus = doctor.user.status;

    // Validate Transition
    if (!validateStatusTransition(currentStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Transactional Update & Audit
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: doctor.userId },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "UPDATE_DOCTOR_STATUS",
          entity: "Doctor",
          entityId: id,
          metadata: {
            oldStatus: currentStatus,
            newStatus,
            reason,
          },
        },
      });
    });

    return { success: true };
  }

  static async deleteDoctor(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Soft delete both Doctor and User
    const now = new Date();

    await prisma.$transaction([
      prisma.doctor.update({
        where: { id },
        data: { deletedAt: now },
      }),
      prisma.user.update({
        where: { id: doctor.userId },
        data: {
          deletedAt: now,
          status: "DEACTIVATED",
        },
      }),
    ]);

    return { success: true };
  }

  static async getDoctorById(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, status: true, createdAt: true },
        },
        department: { select: { id: true, name: true } },
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    return {
      id: doctor.id,
      name: doctor.name,
      email: doctor.user.email,
      specialization: doctor.specialization,
      department: doctor.department,
      status: doctor.user.status,
      createdAt: doctor.user.createdAt,
    };
  }

  static async getDoctorProfileByUserId(userId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true },
        },
        department: {
          select: { id: true, name: true },
        },
        schedules: true,
      },
    });

    if (!doctor) throw new Error("Doctor not found");

    return {
      ...doctor,
      email: doctor.user.email,
    };
  }

  static async updateDoctorProfileByUserId(
    userId: string,
    data: { name: string; email: string; departmentId: string },
  ) {
    return await prisma.$transaction(async (tx) => {
      if (data.email) {
        const existingUser = await tx.user.findFirst({
          where: {
            email: data.email,
            NOT: { id: userId },
          },
        });
        if (existingUser) throw new Error("Email already in use");

        await tx.user.update({
          where: { id: userId },
          data: { email: data.email },
        });
      }

      const doctor = await tx.doctor.update({
        where: { userId },
        data: {
          name: data.name,
          departmentId: data.departmentId,
        },
        include: {
          user: { select: { email: true } },
          department: { select: { id: true, name: true } },
        },
      });

      return {
        ...doctor,
        email: doctor.user.email,
      };
    });
  }

  static async updateDoctorAvailabilityByUserId(
    userId: string,
    scheduleData: { days: number[]; startTime: string; endTime: string },
  ) {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) throw new Error("Doctor not found");

    return await prisma.$transaction(async (tx) => {
      await tx.doctorSchedule.deleteMany({
        where: { doctorId: doctor.id },
      });

      const schedules = scheduleData.days.map((day) => ({
        doctorId: doctor.id,
        dayOfWeek: day,
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        isActive: true,
      }));

      if (schedules.length > 0) {
        await tx.doctorSchedule.createMany({
          data: schedules,
        });
      }

      return await tx.doctorSchedule.findMany({
        where: { doctorId: doctor.id },
      });
    });
  }
}
