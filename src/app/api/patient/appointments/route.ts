import { NextRequest, NextResponse } from "next/server";
import {
  requirePatient,
  auditLog,
  AuthenticatedRequest,
} from "@/lib/permissions/patient.permission";
import { prisma } from "@/lib/prisma";
import {
  createAppointmentSchema,
  patientAppointmentQuerySchema,
} from "@/lib/validators/patient.validator";
import { z, ZodError } from "zod";
import { AppointmentService } from "@/lib/services/appointment.service";
import { PatientAppointmentService } from "@/lib/services/patient-appointment.service";

export async function POST(request: AuthenticatedRequest) {
  const authError = await requirePatient(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const validatedData = createAppointmentSchema.parse(body);
    const userId = request.user!.id;
    console.log("Appointment Request - UserID:", userId);

    // Paranoid check: Ensure user actually exists in DB
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.error(`User ${userId} not found in DB despite valid token`);
      return NextResponse.json(
        { error: "User authentication invalid" },
        { status: 401 },
      );
    }

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
          },
          select: { id: true },
        });
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // 2. Call Service
    const appointment = await AppointmentService.createAppointment({
      userId,
      patientId: patient.id,
      doctorId: validatedData.doctorId,
      departmentId: validatedData.departmentId,
      scheduledAt: new Date(validatedData.scheduledAt),
      notes: validatedData.notes,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error booking appointment:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      // Handle known service errors
      if (
        error.message.includes("Doctor is not available") ||
        error.message.includes("booked at this time") ||
        error.message.includes("already has an appointment")
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (
        error.message.includes("not available on this day") ||
        error.message.includes("only available between")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 },
    );
  }
}

export async function GET(request: AuthenticatedRequest) {
  const authError = await requirePatient(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
      status: (searchParams.get("status") as any) || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const validatedParams = patientAppointmentQuerySchema.parse(params);
    const result = await PatientAppointmentService.getAppointments(
      request.user!.id,
      validatedParams,
    );

    auditLog(
      request.user!.id,
      "PATIENT_LIST_APPOINTMENTS",
      "Appointment",
      undefined,
      { params: validatedParams },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing patient appointments:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to list appointments" },
      { status: 500 },
    );
  }
}
