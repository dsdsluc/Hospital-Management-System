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
    const departments = await prisma.department.findMany({
      where: {
        deletedAt: null,
        doctors: {
          some: {
            user: { status: "ACTIVE" },
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 },
    );
  }
}
