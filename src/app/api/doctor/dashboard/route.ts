import { NextResponse } from "next/server";
import { requireDoctor, AuthenticatedRequest } from "@/lib/permissions/doctor.permission";
import { DoctorDashboardService } from "@/lib/services/doctor-dashboard.service";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireDoctor(request);
  if (authError) return authError;

  try {
    const dashboardData = await DoctorDashboardService.getDashboardStats(request.user!.id);
    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch dashboard data" }, { status: 500 });
  }
}
