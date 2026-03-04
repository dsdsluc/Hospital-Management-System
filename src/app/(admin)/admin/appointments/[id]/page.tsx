"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import {
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Stethoscope,
  MapPin,
  Edit,
} from "lucide-react";

interface AppointmentDetails {
  id: string;
  scheduledAt: string;
  status: string;
  reason?: string;
  notes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    email: string;
    contact: string | null;
    gender: string | null;
    dob: string | null;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string | null;
    department: { name: string } | null;
  };
  department: {
    id: string;
    name: string;
  };
  visit?: {
    id: string;
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
  const [actionLoading, setActionLoading] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`);
      if (!res.ok) throw new Error("Failed to load appointment details");
      const data = await res.json();
      setAppointment(data);
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Simple fetch for doctors list - assuming an endpoint exists or we reuse the admin list one
      // For now, let's assume we can filter by department if needed, but let's just get all active
      const res = await fetch(`/api/admin/doctors?limit=100&status=ACTIVE`);
      if (!res.ok) throw new Error("Failed to load doctors");
      const data = await res.json();
      setDoctors(data.data);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    }
  };

  const handleStatusUpdate = async (newStatus: string, reason?: string) => {
    if (!appointment) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          version: appointment.version,
          reason,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update status");
      }

      addToast("success", "Status updated successfully");
      fetchAppointmentDetails();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!appointment || !selectedDoctor) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/reassign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          version: appointment.version,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reassign doctor");
      }

      addToast("success", "Doctor reassigned successfully");
      setReassignModalOpen(false);
      fetchAppointmentDetails();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  if (!appointment)
    return <div className="text-center py-20">Appointment not found</div>;

  const transitions: Record<string, string[]> = {
    REQUESTED: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
    CHECKED_IN: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
    RESCHEDULED: ["CONFIRMED", "CANCELLED"],
  };

  const allowedStatuses = transitions[appointment.status] || [];

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/appointments")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Details
          </h1>
          <p className="text-sm text-gray-500">ID: {appointment.id}</p>
        </div>
        <div className="ml-auto flex gap-3">
          {["REQUESTED", "CONFIRMED", "RESCHEDULED"].includes(
            appointment.status,
          ) && (
            <button
              onClick={() => {
                setReassignModalOpen(true);
                fetchDoctors();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Edit size={16} />
              Reassign Doctor
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Current Status
              </h2>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {allowedStatuses.length > 0 ? (
                allowedStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark as {status.replace("_", " ")}
                  </button>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">
                  No further actions available
                </span>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-gray-900">
                    {new Date(appointment.scheduledAt).toLocaleDateString(
                      undefined,
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-gray-900">
                    {new Date(appointment.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>
                  <p className="text-gray-900">{appointment.department.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p className="text-gray-900">{appointment.reason || "N/A"}</p>
                </div>
              </div>
            </div>
            {appointment.notes && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: People */}
        <div className="space-y-6">
          {/* Patient Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Patient</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">
                  {appointment.patient.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {appointment.patient.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium text-gray-900">
                  {appointment.patient.contact || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Doctor</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">
                  {appointment.doctor.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium text-gray-900">
                  {appointment.doctor.specialization || "General"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">
                  {appointment.doctor.department?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Reassign Doctor</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select a new doctor for this appointment. Ensure they are in the
              correct department.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReassignModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedDoctor || actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Confirm Reassignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
