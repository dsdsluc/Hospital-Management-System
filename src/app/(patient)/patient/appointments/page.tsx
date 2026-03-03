"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/patient/shared/PageHeader";
import { AppointmentCard } from "@/components/patient/appointments/AppointmentCard";
import { AppointmentFilters } from "@/components/patient/appointments/AppointmentFilters";
import { Pagination } from "@/components/patient/shared/Pagination";
import { EmptyState } from "@/components/patient/shared/EmptyState";
import { ConfirmDialog } from "@/components/patient/shared/ConfirmDialog";
import Button from "@/components/ui/Button";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  department: {
    id: string;
    name: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter, currentPage]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "6");

      // Handle Status Filter
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      // Handle Date Filter
      if (dateFilter) {
        const now = new Date();
        if (dateFilter === "upcoming") {
          params.append("startDate", now.toISOString());
        } else if (dateFilter === "past_30") {
          const past30 = new Date(now);
          past30.setDate(now.getDate() - 30);
          params.append("startDate", past30.toISOString());
          params.append("endDate", now.toISOString());
        } else if (dateFilter === "past_6m") {
          const past6m = new Date(now);
          past6m.setMonth(now.getMonth() - 6);
          params.append("startDate", past6m.toISOString());
          params.append("endDate", now.toISOString());
        }
      }

      const res = await fetch(`/api/patient/appointments?${params}`);

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

  const handleCancel = async () => {
    if (!cancelId) return;

    try {
      const res = await fetch(`/api/patient/appointments/${cancelId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Patient requested cancellation" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel appointment");
      }

      addToast("success", "Appointment cancelled successfully");
      fetchAppointments();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setCancelId(null);
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  const canCancel = (status: string) => {
    return ["REQUESTED", "CONFIRMED"].includes(status);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <PageHeader
        title="My Appointments"
        description="Manage your upcoming and past appointments."
        action={
          <Button
            className="gap-2"
            onClick={() => router.push("/patient/appointments/book")}
          >
            <Plus size={18} />
            Book New Appointment
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AppointmentFilters
          statusFilter={statusFilter}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          dateFilter={dateFilter}
          onDateChange={(val) => {
            setDateFilter(val);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appointments.map((apt) => {
            const { date, time } = formatDateTime(apt.scheduledAt);
            return (
              <AppointmentCard
                key={apt.id}
                appointment={{
                  id: apt.id,
                  doctorName: apt.doctor.name,
                  specialty: apt.doctor.specialization || "General",
                  date,
                  time,
                  location: apt.department.name,
                  status: formatStatus(apt.status),
                  imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(apt.doctor.name)}`,
                  canCancel: canCancel(apt.status),
                }}
                onCancel={(id) => setCancelId(id)}
                onViewDetails={(id) =>
                  router.push(`/patient/appointments/${id}`)
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No appointments found"
          description={
            statusFilter || dateFilter
              ? "Try adjusting your filters."
              : "You haven't booked any appointments yet."
          }
          icon={Calendar}
          action={
            statusFilter || dateFilter ? (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setStatusFilter("");
                  setDateFilter("");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel It"
        variant="danger"
      />
    </div>
  );
}
