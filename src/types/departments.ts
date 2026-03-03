export interface DepartmentRef {
  id: string;
  name: string;
}

export interface DepartmentListItem extends DepartmentRef {
  description?: string | null;
  headDoctor?: { id: string; name: string; specialization: string } | null;
  memberCount?: number;
  appointmentCount?: number;
}

export interface DepartmentListResponse {
  data: DepartmentListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
