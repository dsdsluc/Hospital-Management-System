import { NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/permissions/admin.permission";
import { AdminDashboardService } from "@/lib/services/admin-dashboard.service";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const stats = await AdminDashboardService.getStats();
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("Failed to fetch admin dashboard stats", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
