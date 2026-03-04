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
    const status = searchParams.get("status"); // Not directly filterable yet
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {
      patientId: patient.id,
      deletedAt: null,
    };

    if (search) {
      where.type = { contains: search, mode: "insensitive" };
    }

    const [testResults, total] = await Promise.all([
      prisma.testResult.findMany({
        where,
        include: {
          orderedByDoctor: { select: { name: true } },
        },
        orderBy: { reportedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.testResult.count({ where }),
    ]);

    const formattedResults = testResults.map((result) => ({
      id: result.id,
      testName: result.type,
      date: result.reportedAt,
      orderedBy: result.orderedByDoctor?.name || "Unknown",
      status: "normal", // Placeholder logic
      summary: result.resultSummary || "Pending analysis.",
    }));

    auditLog(userId, "PATIENT_LIST_TEST_RESULTS", "TestResult", undefined, {
      search,
      page,
    });

    return NextResponse.json({
      data: formattedResults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing test results:", error);
    return NextResponse.json(
      { error: "Failed to fetch test results" },
      { status: 500 },
    );
  }
}
