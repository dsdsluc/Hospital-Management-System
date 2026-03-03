import { prisma } from "@/lib/prisma";

export class AdminDashboardService {
  static async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // 1. Overall Counts
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingUsers
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.user.count({ where: { status: "PENDING_APPROVAL" } }),
    ]);

    // 2. Appointments Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const appointmentsLast7Days = await prisma.appointment.groupBy({
      by: ['scheduledAt'],
      where: {
        scheduledAt: { gte: sevenDaysAgo },
      },
      _count: {
        id: true,
      },
    });

    // Process daily counts
    const dailyStats = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        dailyStats.set(d.toISOString().split('T')[0], 0);
    }

    appointmentsLast7Days.forEach(apt => {
        const dateKey = apt.scheduledAt.toISOString().split('T')[0];
        // Only count if dateKey is within our range (groupBy returns all if not careful, but we filtered)
        // Also map keys might need adjustment if UTC vs Local issues arise, but for MVP strict ISO is okay.
        // Actually, let's just find the closest match in our dailyStats map to be safe with timezones or just trust filtering.
        if (dailyStats.has(dateKey)) {
             dailyStats.set(dateKey, (dailyStats.get(dateKey) || 0) + apt._count.id);
        } else {
            // Fallback for simple date matching if filtering isn't perfect
             // Iterate keys and check if dates match
             for (const key of dailyStats.keys()) {
                 if (key === dateKey) {
                     dailyStats.set(key, (dailyStats.get(key) || 0) + apt._count.id);
                 }
             }
        }
    });

    const appointmentTrend = Array.from(dailyStats.entries()).map(([date, count]) => ({
        // Use the date string to get weekday name
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        count
    }));


    // 3. Appointments by Department
    const appointmentsByDept = await prisma.appointment.groupBy({
      by: ['departmentId'],
      _count: { id: true },
    });
    
    // Fetch department names manually since groupBy doesn't support include/select relations easily in all prisma versions
    // or requires complex query. Simpler to fetch depts and map.
    const departments = await prisma.department.findMany({ select: { id: true, name: true } });
    const deptMap = new Map(departments.map(d => [d.id, d.name]));

    const departmentDistribution = appointmentsByDept.map(item => ({
        name: deptMap.get(item.departmentId) || 'Unknown',
        value: item._count.id
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5


    // 4. Recent Activity (Latest 5 appointments)
    const recentActivity = await prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            patient: { select: { name: true } },
            doctor: { select: { name: true } },
            department: { select: { name: true } },
        }
    });

    return {
      counts: {
        patients: totalPatients,
        doctors: totalDoctors,
        appointments: totalAppointments,
        pendingApprovals: pendingUsers,
      },
      charts: {
        appointmentTrend,
        departmentDistribution,
      },
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        desc: `Appointment scheduled for ${a.patient.name} with ${a.doctor.name}`,
        date: a.createdAt,
        type: 'APPOINTMENT',
        status: a.status
      }))
    };
  }
}
