import { getJson } from "@/lib/services/http";

export interface DashboardData {
  stats: {
    upcomingAppointment: {
      doctor: string;
      date: string;
      specialty: string;
    } | null;
    activePrescriptionsCount: number;
    vitals: {
      value: string;
      subtext: string;
    };
    pendingTestResultsCount: number;
  };
  upcomingAppointments: {
    id: string;
    doctor: string;
    specialty: string;
    date: string;
    status: string;
  }[];
  recentRecords: {
    id: string;
    name: string;
    date: string;
    doctor: string;
  }[];
  currentMedications: {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
}

export async function getPatientDashboard() {
  return getJson<DashboardData>("/api/patient/dashboard");
}
