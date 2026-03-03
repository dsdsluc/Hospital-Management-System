import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DepartmentListItem,
  DepartmentListResponse,
} from "@/types/departments";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHeadDoctor,
} from "@/lib/services/admin/departments.client";
import {
  getDoctors,
  type DoctorListItem,
} from "@/lib/services/admin/doctors.client";

export function useDepartments() {
  const [items, setItems] = useState<DepartmentListItem[]>([]);
  const [pagination, setPagination] = useState<
    DepartmentListResponse["pagination"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", page: 1, limit: 20 });
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);

  const fetchDoctors = useCallback(async () => {
    const docs = await getDoctors(100);
    setDoctors(docs);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(
      ([k, v]) => v && params.append(k, String(v)),
    );
    const res = await getDepartments(params);
    setItems(res.data);
    setPagination(res.pagination);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = useMemo(
    () => ({
      total: pagination?.total ?? 0,
      withHead: items.filter((d) => !!d.headDoctor).length,
      appts: items
        .map((d) => d.appointmentCount ?? 0)
        .reduce((a, b) => a + b, 0),
    }),
    [items, pagination],
  );

  const onCreate = useCallback(
    async (payload: { name: string; description?: string }) => {
      await createDepartment(payload);
      fetchData();
    },
    [fetchData],
  );

  const onUpdate = useCallback(
    async (id: string, payload: { name?: string; description?: string }) => {
      await updateDepartment(id, payload);
      fetchData();
    },
    [fetchData],
  );

  const onDelete = useCallback(
    async (id: string) => {
      await deleteDepartment(id);
      fetchData();
    },
    [fetchData],
  );

  const onAssignHead = useCallback(
    async (departmentId: string, doctorId: string | null) => {
      await assignHeadDoctor(departmentId, doctorId);
      fetchData();
    },
    [fetchData],
  );

  return {
    items,
    pagination,
    loading,
    filters,
    setFilters,
    summary,
    doctors,
    onCreate,
    onUpdate,
    onDelete,
    onAssignHead,
  };
}
