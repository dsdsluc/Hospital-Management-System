import { prisma } from "@/lib/prisma";

export class MedicalRecordService {
  static async getPatientMedicalHistory(patientId: string) {
    // 1. Fetch Medical Records (Diagnoses, History)
    const records = await prisma.medicalRecord.findMany({
      where: { patientId, deletedAt: null },
      include: {
        doctor: { select: { name: true } },
        prescriptions: true,
        testResults: true,
      },
      orderBy: { encounterDate: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      date: record.encounterDate,
      diagnosis: record.diagnosis,
      allergies: record.allergies,
      vitals: record.vitals,
      doctorName: record.doctor.name,
      filesRef: record.filesRef,
      prescriptions: record.prescriptions,
      testResults: record.testResults,
    }));
  }

  static async getPatientPrescriptions(patientId: string) {
    return await prisma.prescription.findMany({
      where: { patientId, deletedAt: null },
      include: {
        doctor: { select: { name: true } },
        medicalRecord: { select: { diagnosis: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getPatientTestResults(patientId: string) {
    return await prisma.testResult.findMany({
      where: { patientId, deletedAt: null },
      include: {
        orderedByDoctor: { select: { name: true } },
      },
      orderBy: { reportedAt: "desc" },
    });
  }

  static async createPrescription(data: {
    patientId: string;
    doctorId: string;
    medications: Array<{
      name: string;
      dosage: string;
      freq: string;
      duration: string;
    }>;
    instructions?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // Find or create a medical record for today
      let record = await tx.medicalRecord.findFirst({
        where: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          encounterDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          diagnosis: "Admin Entry",
        },
      });

      if (!record) {
        record = await tx.medicalRecord.create({
          data: {
            patientId: data.patientId,
            doctorId: data.doctorId,
            encounterDate: new Date(),
            diagnosis: "Admin Entry",
            vitals: {},
          },
        });
      }

      return await tx.prescription.create({
        data: {
          medicalRecordId: record.id,
          patientId: data.patientId,
          doctorId: data.doctorId,
          medications: data.medications,
          instructions: data.instructions,
        },
      });
    });
  }

  static async updatePrescription(
    id: string,
    data: {
      medications?: Array<{
        name: string;
        dosage: string;
        freq: string;
        duration: string;
      }>;
      instructions?: string;
    },
  ) {
    return await prisma.prescription.update({
      where: { id },
      data: {
        ...(data.medications && { medications: data.medications }),
        ...(data.instructions && { instructions: data.instructions }),
      },
    });
  }

  static async deletePrescription(id: string) {
    return await prisma.prescription.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async createTestResult(data: {
    patientId: string;
    orderedByDoctorId: string;
    type: string;
    resultSummary: string;
    reportedAt: Date;
  }) {
    // Similar to prescription, find or create a record
    return await prisma.$transaction(async (tx) => {
      let record = await tx.medicalRecord.findFirst({
        where: {
          patientId: data.patientId,
          doctorId: data.orderedByDoctorId,
          encounterDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          diagnosis: "Admin Entry",
        },
      });

      if (!record) {
        record = await tx.medicalRecord.create({
          data: {
            patientId: data.patientId,
            doctorId: data.orderedByDoctorId,
            encounterDate: new Date(),
            diagnosis: "Admin Entry",
            vitals: {},
          },
        });
      }

      return await tx.testResult.create({
        data: {
          medicalRecordId: record.id,
          patientId: data.patientId,
          orderedByDoctorId: data.orderedByDoctorId,
          type: data.type,
          resultSummary: data.resultSummary,
          reportedAt: data.reportedAt,
        },
      });
    });
  }

  static async updateTestResult(
    id: string,
    data: {
      type?: string;
      resultSummary?: string;
      reportedAt?: Date;
    },
  ) {
    return await prisma.testResult.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.resultSummary && { resultSummary: data.resultSummary }),
        ...(data.reportedAt && { reportedAt: data.reportedAt }),
      },
    });
  }

  static async deleteTestResult(id: string) {
    return await prisma.testResult.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async createMedicalRecord(data: {
    patientId: string;
    doctorId: string;
    diagnosis: string;
    allergies?: string;
    vitals?: any;
    filesRef?: string;
  }) {
    return await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis,
        allergies: data.allergies,
        vitals: data.vitals,
        filesRef: data.filesRef,
        encounterDate: new Date(),
      },
    });
  }
}
