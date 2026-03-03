"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Play,
  CheckCircle,
} from "lucide-react";

export default function DoctorAppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, addToast, removeToast } = useToast();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: "COMPLETE" | "CANCEL" | "CHECK_IN" | "START_VISIT" | null;
  }>({ open: false, action: null });

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchAppointment();
  }, []);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor/appointments/${params.id}`);

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch appointment");

      const data = await res.json();
      setAppointment(data);
    } catch (error) {
      addToast("error", "Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!confirmAction.action) return;

    try {
      const action = confirmAction.action;
      let body: any = {};

      if (action === "COMPLETE") {
        if (!diagnosis) {
          addToast("error", "Diagnosis is required to complete appointment");
          return;
        }
        body = {
          status: "COMPLETED",
          diagnosis,
          notes,
        };
      } else if (action === "CANCEL") {
        body = { status: "CANCELLED" };
      } else if (action === "CHECK_IN") {
        body = { status: "CHECKED_IN" };
      } else if (action === "START_VISIT") {
        body = { status: "IN_PROGRESS" };
      }

      const res = await fetch(`/api/doctor/appointments/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update status");
      }

      addToast(
        "success",
        `Appointment ${action.replace("_", " ").toLowerCase()} successfully`,
      );
      fetchAppointment();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setConfirmAction({ open: false, action: null });
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!appointment) {
    return <div>Appointment not found</div>;
  }

  // Determine available actions based on status
  const status = appointment.status;
  const canCancel = [
    "REQUESTED",
    "CONFIRMED",
    "CHECKED_IN",
    "RESCHEDULED",
  ].includes(status);
  const canCheckIn = status === "CONFIRMED";
  const canStartVisit = status === "CHECKED_IN";
  const canComplete = status === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Appointments
      </button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Details
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            <span className="text-sm text-gray-500">ID: {appointment.id}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <button
              onClick={() => setConfirmAction({ open: true, action: "CANCEL" })}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm border border-red-200"
            >
              Cancel
            </button>
          )}

          {canCheckIn && (
            <button
              onClick={() =>
                setConfirmAction({ open: true, action: "CHECK_IN" })
              }
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm border border-indigo-200 flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Check In Patient
            </button>
          )}

          {canStartVisit && (
            <button
              onClick={() =>
                setConfirmAction({ open: true, action: "START_VISIT" })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Visit
            </button>
          )}

          {canComplete && (
            <button
              onClick={() =>
                setConfirmAction({ open: true, action: "COMPLETE" })
              }
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Complete Appointment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                <User className="w-5 h-5" />
              </div>
              Patient Information
            </h2>
            <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${appointment.patient.name}`}
                alt="Patient"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <p className="text-lg font-medium text-gray-900">
                {appointment.patient.name}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <p className="text-base text-gray-700 break-words font-medium">
                {appointment.patient.user.email}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Phone
              </label>
              <p className="text-base text-gray-900">
                {appointment.patient.contact || "-"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Gender
              </label>
              <p className="text-base text-gray-900 capitalize">
                {appointment.patient.gender?.toLowerCase() || "-"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Date of Birth
              </label>
              <p className="text-base text-gray-900">
                {appointment.patient.dob
                  ? new Date(appointment.patient.dob).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "-"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Address
              </label>
              <p className="text-base text-gray-900">
                {appointment.patient.address || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3 text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              Appointment Details
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Date
                </label>
                <div className="flex items-center text-indigo-700 font-bold text-lg">
                  <Calendar className="w-5 h-5 mr-2 opacity-70" />
                  {new Date(appointment.scheduledAt).toLocaleDateString(
                    undefined,
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Time
                </label>
                <div className="flex items-center text-indigo-700 font-bold text-lg">
                  <Clock className="w-5 h-5 mr-2 opacity-70" />
                  {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Department
              </label>
              <div className="flex items-center text-base text-gray-900 font-medium">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                  <MapPin className="w-4 h-4" />
                </div>
                {appointment.department.name}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Visit Notes
              </label>
              <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                {appointment.notes ? (
                  <span className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                    {appointment.notes}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">
                    No notes provided for this appointment.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction.open}
        onClose={() => setConfirmAction({ open: false, action: null })}
        onConfirm={handleStatusUpdate}
        title={
          confirmAction.action === "COMPLETE"
            ? "Complete Appointment"
            : confirmAction.action === "CHECK_IN"
              ? "Check In Patient"
              : confirmAction.action === "START_VISIT"
                ? "Start Visit"
                : "Cancel Appointment"
        }
        message={
          confirmAction.action === "COMPLETE" ? (
            <div className="space-y-4">
              <p>Please enter the diagnosis to complete this appointment.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis *
                </label>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full border rounded-md p-2"
                  rows={2}
                  placeholder="Enter diagnosis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded-md p-2"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          ) : confirmAction.action === "CHECK_IN" ? (
            "Confirm patient has arrived and is ready to check in?"
          ) : confirmAction.action === "START_VISIT" ? (
            "Start the consultation now?"
          ) : (
            "Are you sure you want to cancel this appointment?"
          )
        }
        confirmButtonClassName={
          confirmAction.action === "CANCEL"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }
      />
    </div>
  );
}
