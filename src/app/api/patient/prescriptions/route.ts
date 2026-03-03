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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {
      patientId: patient.id,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          medications: {
            path: ["name"], // Assuming JSON structure
            string_contains: search,
            mode: "insensitive",
          },
        },
        // Or if searching by doctor
        { doctor: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          doctor: { select: { name: true, specialization: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.prescription.count({ where }),
    ]);

    const formattedPrescriptions = prescriptions.map((prescription) => {
      // Mock status logic based on date + duration (simplified)
      const startDate = new Date(prescription.createdAt);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 30); // Default 30 days if not parsed
      const isActive = new Date() < endDate;

      return {
        id: prescription.id,
        medications: Array.isArray(prescription.medications)
          ? (prescription.medications as any[]).map((m: any) => ({
              name: m.name || "Unknown",
              dosage: m.dosage || "",
              frequency: m.freq || "",
              duration: m.duration || "N/A",
            }))
          : [],
        createdAt: prescription.createdAt.toISOString(), // Ensure string format
        doctor: {
          name: prescription.doctor.name,
          specialization:
            (prescription.doctor as any).specialization || "General",
        },
        status: isActive ? "active" : "expired",
        instructions:
          prescription.instructions ||
          (Array.isArray(prescription.medications)
            ? (prescription.medications as any[])
                .map((m: any) => m.freq)
                .join(". ")
            : ""),
      };
    });

    auditLog(userId, "PATIENT_LIST_PRESCRIPTIONS", "Prescription", undefined, {
      search,
      page,
    });

    return NextResponse.json({
      data: formattedPrescriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 },
    );
  }
}
