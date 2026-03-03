import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

export class PatientDashboardService {
  static async getDashboardStats(patientId: string) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      upcomingAppointment,
      activePrescriptionsCount,
      latestMedicalRecord,
      pendingTestResultsCount,
      recentAppointments,
      recentMedicalRecords,
      activePrescriptions
    ] = await Promise.all([
      // 1. Upcoming Appointment (Next one)
      prisma.appointment.findFirst({
        where: {
          patientId,
          scheduledAt: { gt: now },
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.REQUESTED, AppointmentStatus.RESCHEDULED] },
        },
        orderBy: { scheduledAt: "asc" },
        include: {
          doctor: {
            select: { name: true, specialization: true },
          },
        },
      }),

      // 2. Active Prescriptions Count (Total prescriptions created in last 30 days? Or just count all?)
      // Since we don't have an "active" status, we'll just count recent prescriptions (last 30 days)
      prisma.prescription.count({
        where: {
          patientId,
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) },
        },
      }),

      // 3. Latest Medical Record (For vitals)
      prisma.medicalRecord.findFirst({
        where: { patientId },
        orderBy: { encounterDate: "desc" },
        select: { vitals: true, encounterDate: true },
      }),

      // 4. Pending Reports (Test results with null resultSummary)
      prisma.testResult.count({
        where: {
          patientId,
          resultSummary: null,
        },
      }),

      // 5. Recent Appointments (Last 5)
      prisma.appointment.findMany({
        where: { patientId },
        orderBy: { scheduledAt: "desc" },
        take: 3,
        include: {
          doctor: {
            select: { name: true, specialization: true },
          },
        },
      }),

      // 6. Recent Medical Records (Last 5)
      prisma.medicalRecord.findMany({
        where: { patientId },
        orderBy: { encounterDate: "desc" },
        take: 3,
        include: {
          doctor: {
            select: { name: true },
          },
        },
      }),

      // 7. Active Prescriptions (List for "Current Medications")
      prisma.prescription.findMany({
        where: {
          patientId,
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          medications: true,
          createdAt: true,
        },
      }),
    ]);

    // Process Vitals
    let vitals = "N/A";
    let vitalsSubtext = "No recent data";
    if (latestMedicalRecord?.vitals) {
      const v = latestMedicalRecord.vitals as any;
      if (v.bp) {
        vitals = v.bp;
        vitalsSubtext = `Recorded on ${latestMedicalRecord.encounterDate.toLocaleDateString()}`;
      }
    }

    // Process Medications
    // Flatten medications array from multiple prescriptions
    const currentMedications = activePrescriptions.flatMap((p) => {
      const meds = p.medications as any[]; // Expecting array of objects
      return meds.map(m => ({
        ...m,
        prescribedDate: p.createdAt
      }));
    }).slice(0, 4); // Limit to 4

    return {
      stats: {
        upcomingAppointment: upcomingAppointment ? {
          doctor: upcomingAppointment.doctor.name,
          date: upcomingAppointment.scheduledAt,
          specialty: upcomingAppointment.doctor.specialization,
        } : null,
        activePrescriptionsCount,
        vitals: {
          value: vitals,
          subtext: vitalsSubtext,
        },
        pendingTestResultsCount,
      },
      upcomingAppointments: recentAppointments.map(a => ({
        id: a.id,
        doctor: a.doctor.name,
        specialty: a.doctor.specialization,
        date: a.scheduledAt,
        status: a.status,
      })),
      recentRecords: recentMedicalRecords.map(r => ({
        id: r.id,
        name: r.diagnosis || "Medical Record", // Use diagnosis as name or fallback
        date: r.encounterDate,
        doctor: r.doctor.name,
      })),
      currentMedications: currentMedications.map((m, i) => ({
        id: i,
        name: m.name || "Unknown",
        dosage: m.dosage || "",
        frequency: m.freq || "",
        duration: m.duration || "",
      })),
    };
  }
}
