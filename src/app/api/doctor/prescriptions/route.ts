import { NextRequest, NextResponse } from "next/server";
import { requireDoctor, AuthenticatedRequest } from "@/lib/permissions/doctor.permission";
import { prisma } from "@/lib/prisma";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireDoctor(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: request.user!.id },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId: doctor.id,
        OR: search ? [
            {
                patient: {
                    name: { contains: search, mode: "insensitive" }
                }
            },
            // Since medications is JSON, searching inside it directly via Prisma is database-dependent.
            // Postgres supports JSONB queries, but for simplicity/compatibility we might filter in code or just search patient name.
            // Let's stick to patient name for now.
        ] : undefined
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            gender: true,
            dob: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: prescriptions });
  } catch (error) {
    console.error("Failed to fetch prescriptions", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
