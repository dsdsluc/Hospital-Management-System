"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { DataTable, Pagination } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { AppointmentCalendar } from "@/components/shared/AppointmentCalendar";
import { LayoutList, Calendar as CalendarIcon } from "lucide-react";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20,
  });

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
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit,
  ]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await fetch(`/api/doctor/appointments?${params}`);

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

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
          <div className="text-xs text-gray-500">{value.user?.email}</div>
        </div>
      ),
    },
    {
      key: "scheduledAt",
      header: "Date & Time",
      render: (value: string) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "department",
      header: "Department",
      render: (value: any) => value?.name || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <PageHeader
        title="My Appointments"
        description="Manage your schedule and patient visits"
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

      <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="REQUESTED">Requested</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
          <option value="RESCHEDULED">Rescheduled</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value, page: 1 })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value, page: 1 })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {viewMode === "list" ? (
        <>
          <DataTable
            columns={columns}
            data={appointments}
            loading={loading}
            onRowClick={(apt) => router.push(`/doctor/appointments/${apt.id}`)}
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
        <AppointmentCalendar appointments={appointments} role="doctor" />
      )}
    </div>
  );
}
