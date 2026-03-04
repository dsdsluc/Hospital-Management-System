import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const count = await prisma.doctor.count();

    if (count > 0) {
      const doctors = await prisma.doctor.findMany({
        include: { user: true },
      });
      return NextResponse.json({
        message: "Doctors already exist",
        count,
        doctors: doctors.map((d) => ({
          id: d.id,
          name: d.name,
          email: d.user.email,
          status: d.user.status,
          deletedAt: d.deletedAt,
        })),
      });
    }

    const email = "doctor@example.com";
    const password = "Password123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "DOCTOR",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        name: "Dr. Test Doctor",
        specialization: "General Practice",
        licenseNo: "DOC123456",
      },
    });

    return NextResponse.json({
      message: "Created test doctor",
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 },
    );
  }
}
