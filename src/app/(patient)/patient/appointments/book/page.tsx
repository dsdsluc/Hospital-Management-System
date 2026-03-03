"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/patient/shared/PageHeader";
import { Calendar, Clock, ArrowLeft, Building, User } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export default function BookAppointmentPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchDoctors(selectedDept);
    } else {
      setDoctors([]);
      setSelectedDoctor("");
    }
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/patient/departments");
      if (!res.ok) throw new Error("Failed to load departments");
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      addToast("error", "Failed to load departments");
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchDoctors = async (deptId: string) => {
    setLoadingDoctors(true);
    try {
      const res = await fetch(`/api/patient/doctors?departmentId=${deptId}`);
      if (!res.ok) throw new Error("Failed to load doctors");
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      addToast("error", "Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !selectedDoctor || !date || !time) {
      addToast("error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const res = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDept,
          doctorId: selectedDoctor,
          scheduledAt,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      addToast("success", "Appointment booked successfully!");
      router.push("/patient/appointments");
      router.refresh();
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate min date (today)
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Appointments
      </button>

      <PageHeader
        title="Book New Appointment"
        description="Schedule a consultation with our specialists."
      />

      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                disabled={loadingDepts}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Choose a department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                disabled={!selectedDept || loadingDoctors}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">
                  {!selectedDept
                    ? "Select a department first"
                    : loadingDoctors
                      ? "Loading doctors..."
                      : "Choose a doctor..."}
                </option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Briefly describe your symptoms or reason for visit..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full justify-center py-3 text-base font-medium"
            >
              {submitting ? (
                <>
                  <Spinner className="w-5 h-5 mr-2 text-white" />
                  Booking Appointment...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
