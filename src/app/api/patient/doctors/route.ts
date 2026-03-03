import { NextRequest, NextResponse } from "next/server";
import {
  requirePatient,
  AuthenticatedRequest,
} from "@/lib/permissions/patient.permission";
import { prisma } from "@/lib/prisma";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requirePatient(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 },
      );
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        departmentId,
        user: { status: "ACTIVE" },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        specialization: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 },
    );
  }
}
