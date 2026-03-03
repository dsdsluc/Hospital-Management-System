import { getJson } from "@/lib/services/http";

export interface AdminDashboardStats {
  counts: {
    patients: number;
    doctors: number;
    appointments: number;
    pendingApprovals: number;
  };
  charts: {
    appointmentTrend: { name: string; count: number }[];
    departmentDistribution: { name: string; value: number }[];
  };
  recentActivity: {
    id: string;
    desc: string;
    date: string;
    type: string;
    status: string;
  }[];
}

export async function getAdminDashboardStats() {
  return getJson<{ data: AdminDashboardStats }>("/api/admin/dashboard").then(res => res.data);
}
