import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  headDoctorId: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  headDoctorId: z.string().optional().nullable(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export class DepartmentService {
  async listDepartments(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DepartmentWhereInput = {};
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        {
          headDoctor: {
            name: { contains: params.search, mode: "insensitive" },
          },
        },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        include: {
          headDoctor: {
            select: { id: true, name: true, specialization: true },
          },
          _count: {
            select: { doctors: true, appointments: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.department.count({ where }),
    ]);

    return {
      data: departments.map((department) => ({
        id: department.id,
        name: department.name,
        description: department.description,
        headDoctor: department.headDoctor,
        memberCount: department._count.doctors,
        appointmentCount: department._count.appointments,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createDepartment(input: CreateDepartmentInput) {
    // Check if department name already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name: input.name },
    });

    if (existingDepartment) {
      throw new Error("Department with this name already exists");
    }

    // Validate head doctor if provided
    if (input.headDoctorId) {
      const headDoctor = await prisma.doctor.findUnique({
        where: { id: input.headDoctorId },
      });

      if (!headDoctor) {
        throw new Error("Head doctor not found");
      }

      // Check if this doctor is already head of another department
      const existingHead = await prisma.department.findFirst({
        where: { headDoctorId: input.headDoctorId },
      });

      if (existingHead) {
        throw new Error("This doctor is already head of another department");
      }
    }

    const department = await prisma.department.create({
      data: {
        name: input.name,
        description: input.description || null,
        headDoctorId: input.headDoctorId || null,
      },
      include: {
        headDoctor: {
          select: { id: true, name: true, specialization: true },
        },
        _count: {
          select: { doctors: true },
        },
      },
    });

    return {
      id: department.id,
      name: department.name,
      description: department.description,
      headDoctor: department.headDoctor,
      memberCount: department._count.doctors,
    };
  }

  async updateDepartment(id: string, input: UpdateDepartmentInput) {
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    // Validate head doctor if provided and different from current
    if (
      input.headDoctorId !== undefined &&
      input.headDoctorId !== department.headDoctorId
    ) {
      if (input.headDoctorId === null) {
        // Allow removing head doctor
      } else {
        const headDoctor = await prisma.doctor.findUnique({
          where: { id: input.headDoctorId },
        });

        if (!headDoctor) {
          throw new Error("Head doctor not found");
        }

        // Check if this doctor is already head of another department
        const existingHead = await prisma.department.findFirst({
          where: {
            headDoctorId: input.headDoctorId,
            id: { not: id }, // Exclude current department
          },
        });

        if (existingHead) {
          throw new Error("This doctor is already head of another department");
        }
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: input.name || department.name,
        description:
          input.description !== undefined
            ? input.description
            : department.description,
        headDoctorId:
          input.headDoctorId !== undefined
            ? input.headDoctorId
            : department.headDoctorId,
      },
      include: {
        headDoctor: {
          select: { id: true, name: true, specialization: true },
        },
        _count: {
          select: { doctors: true },
        },
      },
    });

    return {
      id: updatedDepartment.id,
      name: updatedDepartment.name,
      description: updatedDepartment.description,
      headDoctor: updatedDepartment.headDoctor,
      memberCount: updatedDepartment._count.doctors,
    };
  }

  async deleteDepartment(id: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid department id')
    }
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { doctors: true, appointments: true },
        },
      },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    // Safety validation: Check if department has members or appointments
    if (department._count.doctors > 0) {
      throw new Error("Cannot delete department with active members");
    }

    if (department._count.appointments > 0) {
      throw new Error("Cannot delete department with associated appointments");
    }

    await prisma.department.delete({
      where: { id },
    });

    return { success: true };
  }

  async deleteDepartmentSafe(id: string) {
    return this.deleteDepartment(id);
  }

  async assignHeadDoctor(departmentId: string, doctorId: string | null) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      throw new Error("Department not found");
    }

    if (doctorId === null) {
      const updated = await prisma.department.update({
        where: { id: departmentId },
        data: { headDoctorId: null },
        include: {
          headDoctor: {
            select: { id: true, name: true, specialization: true },
          },
          _count: { select: { doctors: true } },
        },
      });
      return {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        headDoctor: updated.headDoctor,
        memberCount: updated._count.doctors,
      };
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, departmentId: true },
    });
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    if (doctor.departmentId !== departmentId) {
      throw new Error("Head doctor must belong to this department");
    }

    const existingHead = await prisma.department.findFirst({
      where: { headDoctorId: doctorId },
    });
    if (existingHead && existingHead.id !== departmentId) {
      throw new Error("This doctor already heads another department");
    }

    const updated = await prisma.department.update({
      where: { id: departmentId },
      data: { headDoctorId: doctorId },
      include: {
        headDoctor: { select: { id: true, name: true, specialization: true } },
        _count: { select: { doctors: true } },
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      headDoctor: updated.headDoctor,
      memberCount: updated._count.doctors,
    };
  }

  async getDepartmentStats(id: string) {
    const now = new Date();

    const [
      doctorCounts,
      totalAppointments,
      upcomingAppointments,
      patientPairs,
    ] = await Promise.all([
      prisma.doctor
        .findMany({
          where: { departmentId: id },
          select: { user: { select: { status: true } } },
        })
        .then((rows) => ({
          totalDoctors: rows.length,
          activeDoctors: rows.filter((r) => r.user.status === "ACTIVE").length,
        })),
      prisma.appointment.count({ where: { departmentId: id } }),
      prisma.appointment.count({
        where: { departmentId: id, scheduledAt: { gt: now } },
      }),
      prisma.appointment.groupBy({
        by: ["departmentId", "patientId"],
        where: { departmentId: id },
      }),
    ]);

    const totalPatientsServed = patientPairs.length;

    const head = await prisma.department.findUnique({
      where: { id },
      select: {
        headDoctor: { select: { id: true, name: true, specialization: true } },
      },
    });

    return {
      totalDoctors: doctorCounts.totalDoctors,
      activeDoctors: doctorCounts.activeDoctors,
      totalAppointments,
      upcomingAppointments,
      totalPatientsServed,
      headDoctor: head?.headDoctor || null,
    };
  }

  async getDepartmentDetails(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        headDoctor: { select: { id: true, name: true, specialization: true } },
        doctors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            user: { select: { status: true } },
          },
        },
        _count: { select: { doctors: true, appointments: true } },
      },
    });
    if (!department) {
      throw new Error("Department not found");
    }

    const stats = await this.getDepartmentStats(id);
    return {
      id: department.id,
      name: department.name,
      description: department.description,
      headDoctor: department.headDoctor,
      members: department.doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        status: d.user.status,
      })),
      memberCount: department._count.doctors,
      appointmentCount: department._count.appointments,
      stats,
    };
  }

  async getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        headDoctor: {
          select: { id: true, name: true, specialization: true },
        },
        doctors: {
          select: { id: true, name: true, specialization: true },
        },
        _count: {
          select: { doctors: true },
        },
      },
    });

    if (!department) {
      throw new Error("Department not found");
    }

    return {
      id: department.id,
      name: department.name,
      description: department.description,
      headDoctor: department.headDoctor,
      members: department.doctors,
      memberCount: department._count.doctors,
    };
  }
}

export const departmentService = new DepartmentService();
