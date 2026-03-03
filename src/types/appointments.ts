export type AppointmentStatus =
  | "BOOKED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export interface PersonRef {
  id: string;
  name: string;
}

export interface AppointmentDoctor extends PersonRef {
  specialization: string;
}

export interface AppointmentDepartment extends PersonRef {}

export interface AppointmentPatient extends PersonRef {
  email: string;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string | null;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  department: AppointmentDepartment;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentListResponse {
  data: Appointment[];
  pagination: PaginationInfo;
}

export interface AppointmentFilters {
  startDate: string;
  endDate: string;
  departmentId: string;
  status: "" | AppointmentStatus;
  doctorId: string;
  search: string;
  page: number;
  limit: number;
}
