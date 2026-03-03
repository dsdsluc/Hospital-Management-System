import { NextRequest, NextResponse } from "next/server";
import {
  requirePatient,
  auditLog,
  AuthenticatedRequest,
} from "@/lib/permissions/patient.permission";
import { prisma } from "@/lib/prisma";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requirePatient(request);
  if (authError) return authError;

  const userId = request.user!.id;

  try {
    // 1. Get Patient ID (or auto-create)
    let patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!patient) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user) {
        patient = await prisma.patient.create({
          data: {
            userId,
            name: user.email.split("@")[0],
            dob: new Date("1990-01-01"), // Default
            gender: "MALE", // Default
            contact: "Pending Update",
            address: "Pending Update",
          },
          select: { id: true },
        });
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    // const type = searchParams.get("type"); // Not used in query yet
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {
      patientId: patient.id,
      deletedAt: null,
    };

    if (search) {
      where.diagnosis = { contains: search, mode: "insensitive" };
    }

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: {
          doctor: { select: { name: true, specialization: true } },
          prescriptions: true,
          testResults: true,
        },
        orderBy: { encounterDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.medicalRecord.count({ where }),
    ]);

    // Transform to match UI expectation
    const formattedRecords = records.map((record) => {
      let type = "Report";
      if (record.testResults.length > 0) type = "Lab Result";
      else if (record.prescriptions.length > 0) type = "Prescription";

      return {
        id: record.id,
        title: record.diagnosis,
        type: type,
        date: record.encounterDate,
        doctorName: record.doctor.name,
        department: record.doctor.specialization,
        status: "final",
        details: record,
      };
    });

    auditLog(
      userId,
      "PATIENT_LIST_MEDICAL_RECORDS",
      "MedicalRecord",
      undefined,
      {
        search,
        page,
      },
    );

    return NextResponse.json({
      data: formattedRecords,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing medical records:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 },
    );
  }
}
