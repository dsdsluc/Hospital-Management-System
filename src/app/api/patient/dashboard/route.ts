import { NextResponse } from "next/server";
import { requirePatient, AuthenticatedRequest } from "@/lib/permissions/patient.permission";
import { PatientDashboardService } from "@/lib/services/patient-dashboard.service";
import { getPatientIdFromUserId } from "@/lib/auth/utils";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requirePatient(request);
  if (authError) return authError;

  try {
    const patientId = await getPatientIdFromUserId(request.user!.id);
    if (!patientId) {
        return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    const dashboardData = await PatientDashboardService.getDashboardStats(patientId);
    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch dashboard data" }, { status: 500 });
  }
}
