import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { patientQuerySchema } from "@/lib/validators/admin.validator";
import type { z } from "zod";

export class PatientService {
  static async getPatients(query: z.infer<typeof patientQuerySchema>) {
    const { page, limit, search, primaryDoctorId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { contact: { contains: search, mode: "insensitive" } },
      ];
    }

    if (primaryDoctorId) {
      where.primaryDoctorId = primaryDoctorId;
    }

    if (status) {
      where.user = { status };
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, status: true, createdAt: true },
          },
          primaryDoctor: {
            select: { id: true, name: true },
          },
          _count: {
            select: { appointments: true },
          },
          appointments: {
            orderBy: { scheduledAt: "desc" },
            take: 1,
            select: { scheduledAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      data: patients.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.user.email,
        status: p.user.status,
        gender: p.gender,
        dob: p.dob,
        contact: p.contact,
        primaryDoctor: p.primaryDoctor,
        createdAt: p.user.createdAt,
        totalAppointments: p._count.appointments,
        lastAppointmentDate: p.appointments[0]?.scheduledAt || null,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getPatientsByDoctor(
    doctorId: string,
    query: { search?: string; limit?: number; page?: number },
  ) {
    const { search, limit = 20, page = 1 } = query;
    const skip = (page - 1) * limit;

    const andConditions: Prisma.PatientWhereInput[] = [
      {
        OR: [
          { primaryDoctorId: doctorId },
          { appointments: { some: { doctorId } } },
        ],
      },
    ];

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { contact: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
      AND: andConditions,
    };

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { email: true },
          },
          appointments: {
            where: { doctorId },
            orderBy: { scheduledAt: "desc" },
            take: 1,
            select: { scheduledAt: true, reason: true },
          },
          medicalRecords: {
            where: { doctorId },
            orderBy: { encounterDate: "desc" },
            take: 1,
            select: { diagnosis: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      data: patients.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.user.email,
        gender: p.gender,
        dob: p.dob,
        lastVisit: p.appointments[0]?.scheduledAt || null,
        condition: p.medicalRecords[0]?.diagnosis || "Unknown",
        avatar: p.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, status: true, createdAt: true },
        },
        primaryDoctor: {
          select: { id: true, name: true },
        },
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    return {
      id: patient.id,
      userId: patient.userId,
      name: patient.name,
      email: patient.user.email,
      status: patient.user.status,
      gender: patient.gender,
      dob: patient.dob,
      contact: patient.contact,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      primaryDoctor: patient.primaryDoctor,
      createdAt: patient.user.createdAt,
    };
  }

  static async updatePatientStatus(
    id: string,
    status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED",
  ) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    await prisma.user.update({
      where: { id: patient.userId },
      data: { status },
    });

    return { success: true };
  }

  static async assignDoctor(id: string, doctorId: string) {
    // Verify doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: { select: { status: true } } },
    });

    if (!doctor) throw new Error("Doctor not found");
    if (doctor.user.status !== "ACTIVE")
      throw new Error("Doctor is not active");

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new Error("Patient not found");

    await prisma.patient.update({
      where: { id },
      data: { primaryDoctorId: doctorId },
    });

    return { success: true };
  }

  static async deletePatient(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!patient) throw new Error("Patient not found");

    const now = new Date();

    await prisma.$transaction([
      prisma.patient.update({
        where: { id },
        data: { deletedAt: now },
      }),
      prisma.user.update({
        where: { id: patient.userId },
        data: {
          deletedAt: now,
          status: "DEACTIVATED",
        },
      }),
    ]);

    return { success: true };
  }

  static async reconcileMissingPatients() {
    // Find users with role PATIENT; we'll check per-user if a Patient record exists
    const orphanUsers = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        deletedAt: null,
      },
    });

    const results = {
      created: 0,
      errors: 0,
    };

    for (const user of orphanUsers) {
      try {
        // Skip if patient profile already exists
        const existing = await prisma.patient.findFirst({
          where: { userId: user.id },
        });
        if (existing) continue;

        const displayName = (user.email?.split("@")[0] ?? "Unknown Patient")
          .replace(/[-_.]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        await prisma.patient.create({
          data: {
            userId: user.id,
            name: displayName,
          },
        });
        results.created++;
      } catch (error) {
        console.error(
          `Failed to create patient profile for user ${user.id}:`,
          error,
        );
        results.errors++;
      }
    }

    return results;
  }
}
