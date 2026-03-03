"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/patient/shared/PageHeader";
import { Card } from "@/components/patient/shared/Card";
import { StatusBadge } from "@/components/patient/shared/StatusBadge";
import Button from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/patient/shared/ConfirmDialog";

interface AppointmentDetails {
  id: string;
  scheduledAt: string;
  status: string;
  reason?: string;
  notes?: string;
  doctor: {
    id: string;
    name: string;
    specialization: string | null;
    contact: string | null;
  };
  department: {
    id: string;
    name: string;
    description: string | null;
  };
  visit?: {
    roomNumber: string | null;
    startedAt: string;
    endedAt: string | null;
  };
}

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patient/appointments/${id}`);

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Appointment not found");
        }
        throw new Error("Failed to load appointment details");
      }

      const data = await res.json();
      setAppointment(data);
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/patient/appointments/${id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Patient requested cancellation from details page",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel appointment");
      }

      addToast("success", "Appointment cancelled successfully");
      fetchAppointmentDetails(); // Refresh details
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setCancelDialogOpen(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(undefined, {
        weekday: "long",
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

  const getStatusType = (status: string) => {
    const s = status.toLowerCase();
    if (s === "requested" || s === "booked" || s === "rescheduled")
      return "warning";
    if (s === "confirmed") return "info";
    if (s === "checked_in" || s === "in_progress") return "info";
    if (s === "completed") return "success";
    if (s === "cancelled" || s === "no_show") return "error";
    return "neutral";
  };

  const canCancel = (status: string) => {
    return ["REQUESTED", "CONFIRMED"].includes(status);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">
          Appointment not found
        </h3>
        <p className="mt-2 text-gray-500">
          The appointment you are looking for does not exist or you don't have
          permission to view it.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push("/patient/appointments")}
        >
          Back to Appointments
        </Button>
      </div>
    );
  }

  const { date, time } = formatDateTime(appointment.scheduledAt);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/patient/appointments")}
          className="text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Details
          </h1>
          <p className="text-gray-500">ID: {appointment.id}</p>
        </div>
        <div className="flex items-center gap-3">
          {canCancel(appointment.status) && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              onClick={() => setCancelDialogOpen(true)}
            >
              Cancel Appointment
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-semibold text-gray-900">Status</h3>
              <StatusBadge
                status={appointment.status.replace(/_/g, " ")}
                type={getStatusType(appointment.status)}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>
                  <p className="font-medium text-gray-900">
                    {appointment.department.name}
                  </p>
                  {appointment.visit?.roomNumber && (
                    <p className="text-sm text-gray-500">
                      Room: {appointment.visit.roomNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p className="font-medium text-gray-900">
                    {appointment.reason || "General Consultation"}
                  </p>
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-500">
                  Notes
                </h4>
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar: Doctor Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900">
              Doctor Information
            </h3>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-100">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(appointment.doctor.name)}`}
                  alt={appointment.doctor.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-gray-900">
                {appointment.doctor.name}
              </h4>
              <p className="text-sm text-blue-600 font-medium">
                {appointment.doctor.specialization || "General Physician"}
              </p>

              <div className="mt-6 w-full space-y-3 border-t border-gray-100 pt-4 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Stethoscope size={16} className="text-gray-400" />
                  <span>{appointment.department.name}</span>
                </div>
                {appointment.doctor.contact && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <User size={16} className="text-gray-400" />
                    <span>{appointment.doctor.contact}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Need Help? */}
          <Card className="bg-slate-50 p-6 border-slate-100">
            <h3 className="mb-2 font-semibold text-gray-900">Need Help?</h3>
            <p className="mb-4 text-sm text-gray-600">
              If you need to reschedule or have questions about your
              appointment, please contact the hospital directly.
            </p>
            <Button variant="outline" className="w-full text-xs">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel It"
        variant="danger"
      />
    </div>
  );
}
