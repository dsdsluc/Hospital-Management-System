import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export class DoctorDashboardService {
  static async getDashboardStats(userId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) throw new Error("Doctor not found");

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [
      todayAppointments,
      pendingConfirmations,
      completedThisWeek,
      totalActivePatients,
      todaysSchedule,
    ] = await Promise.all([
      // 1. Today's Appointments Count
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          scheduledAt: { gte: todayStart, lte: todayEnd },
          status: { not: "CANCELLED" },
          deletedAt: null,
        },
      }),

      // 2. Pending Confirmations
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: "REQUESTED",
          deletedAt: null,
        },
      }),

      // 3. Completed This Week
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: "COMPLETED",
          scheduledAt: { gte: weekStart },
          deletedAt: null,
        },
      }),

      // 4. Total Active Patients (Unique patients seen by this doctor)
      // Since we don't have a direct link table for "Active Patients",
      // we count unique patient IDs from appointments that weren't cancelled.
      prisma.appointment
        .groupBy({
          by: ["patientId"],
          where: {
            doctorId: doctor.id,
            status: { not: "CANCELLED" },
            deletedAt: null,
          },
        })
        .then((groups) => groups.length),

      // 5. Today's Schedule (List)
      prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          scheduledAt: { gte: todayStart, lte: todayEnd },
          deletedAt: null,
        },
        include: {
          patient: {
            select: { name: true, gender: true },
          },
          department: {
            select: { name: true },
          },
        },
        orderBy: { scheduledAt: "asc" },
      }),
    ]);

    return {
      stats: {
        todayAppointments,
        pendingConfirmations,
        completedThisWeek,
        totalActivePatients,
      },
      todaysSchedule: todaysSchedule.map((apt) => ({
        id: apt.id,
        time: apt.scheduledAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        patientName: apt.patient.name,
        department: apt.department?.name || "Unknown",
        status: apt.status,
        avatar: apt.patient.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      })),
    };
  }
}
