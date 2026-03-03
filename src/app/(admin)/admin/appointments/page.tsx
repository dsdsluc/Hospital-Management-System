"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { DataTable, Pagination } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { AppointmentFilters } from "@/components/admin/appointments/AppointmentFilters";
import { AppointmentCalendar } from "@/components/shared/AppointmentCalendar";
import { LayoutList, Calendar as CalendarIcon } from "lucide-react";

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    departmentId: "",
    doctorId: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    // When switching to calendar, we might want to fetch more items
    if (viewMode === "calendar") {
      setFilters((prev) => ({ ...prev, limit: 1000 }));
    } else {
      setFilters((prev) => ({ ...prev, limit: 20 }));
    }
  }, [viewMode]);

  useEffect(() => {
    fetchAppointments();
  }, [
    debouncedSearch,
    filters.status,
    filters.departmentId,
    filters.doctorId,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit, // Add limit dependency
  ]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filters.status) params.append("status", filters.status);
      if (filters.departmentId)
        params.append("departmentId", filters.departmentId);
      if (filters.doctorId) params.append("doctorId", filters.doctorId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await fetch(`/api/admin/appointments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      setAppointments(data.data);
      setPagination(data.pagination);
    } catch (error) {
      addToast("error", "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "patient",
      header: "Patient",
      render: (value: any) => (
        <div>
          <div className="font-medium text-gray-900">{value.name}</div>
          <div className="text-xs text-gray-500">{value.email}</div>
        </div>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (value: any) => (
        <div>
          <div className="font-medium text-gray-900">{value.name}</div>
          <div className="text-xs text-gray-500">{value.specialization}</div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (value: any) => value?.name || "-",
    },
    {
      key: "scheduledAt",
      header: "Scheduled For",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "id",
      header: "Actions",
      className: "text-right",
      render: (_: any, item: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/appointments/${item.id}`);
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <PageHeader
        title="Appointment Management"
        description="View and manage all hospital appointments"
        actions={
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="List View"
            >
              <LayoutList size={20} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "calendar"
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Calendar View"
            >
              <CalendarIcon size={20} />
            </button>
          </div>
        }
      />

      <AppointmentFilters filters={filters} onFiltersChange={setFilters} />

      {viewMode === "list" ? (
        <>
          <DataTable
            columns={columns}
            data={appointments}
            loading={loading}
            onRowClick={(item) => router.push(`/admin/appointments/${item.id}`)}
          />

          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          )}
        </>
      ) : (
        <AppointmentCalendar appointments={appointments} role="admin" />
      )}
    </div>
  );
}
