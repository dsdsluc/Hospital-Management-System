"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  FileText,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import {
  getPatientDashboard,
  DashboardData,
} from "@/lib/services/patient-dashboard.client";
import { format } from "date-fns";

export default function PatientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getPatientDashboard();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-gray-500">
          Track your appointments, prescriptions, and health records.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Appointment"
          value={
            data.stats.upcomingAppointment
              ? data.stats.upcomingAppointment.doctor
              : "No appointments"
          }
          subtext={
            data.stats.upcomingAppointment
              ? format(
                  new Date(data.stats.upcomingAppointment.date),
                  "MMM d, h:mm a",
                )
              : "Schedule a visit"
          }
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Prescriptions"
          value={`${data.stats.activePrescriptionsCount} Active`}
          subtext="Active prescriptions"
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Recent Vitals"
          value={data.stats.vitals.value}
          subtext={data.stats.vitals.subtext}
          icon={Activity}
          color="indigo"
        />
        <StatCard
          title="Pending Reports"
          value={`${data.stats.pendingTestResultsCount} New`}
          subtext="Test Results"
          icon={AlertCircle}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Appointments Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Upcoming Appointments
                </h3>
                <p className="text-sm text-gray-500">
                  Your scheduled visits with doctors
                </p>
              </div>
              <Link
                href="/patient/appointments"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {data.upcomingAppointments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No upcoming appointments found.
                </p>
              ) : (
                data.upcomingAppointments.map((apt) => (
                  <AppointmentItem
                    key={apt.id}
                    doctor={apt.doctor}
                    specialty={apt.specialty}
                    date={format(new Date(apt.date), "MMMM d, yyyy")}
                    time={format(new Date(apt.date), "h:mm a")}
                    status={apt.status.toLowerCase()}
                    image={`https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.doctor}`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Recent Medical Records */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Medical Records
                </h3>
                <p className="text-sm text-gray-500">
                  Access your latest health documents
                </p>
              </div>
              <Link
                href="/patient/medical-records"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Document Name</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Doctor</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-600">
                  {data.recentRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-gray-500"
                      >
                        No recent medical records found.
                      </td>
                    </tr>
                  ) : (
                    data.recentRecords.map((record) => (
                      <RecordRow
                        key={record.id}
                        name={record.name}
                        date={format(new Date(record.date), "MMM d, yyyy")}
                        doctor={record.doctor}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar/Widgets) */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-200">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/patient/appointments/new"
                className="w-full rounded-xl bg-white/10 p-3 text-left text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-between group"
              >
                Book New Appointment
                <ChevronRight
                  size={16}
                  className="opacity-70 group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/patient/prescriptions"
                className="w-full rounded-xl bg-white/10 p-3 text-left text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-between group"
              >
                Request Prescription Refill
                <ChevronRight
                  size={16}
                  className="opacity-70 group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/patient/medical-records/upload"
                className="w-full rounded-xl bg-white/10 p-3 text-left text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-between group"
              >
                Upload Medical Documents
                <ChevronRight
                  size={16}
                  className="opacity-70 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          {/* Current Medications */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Current Medications
              </h3>
              <MoreHorizontal
                size={20}
                className="text-gray-400 cursor-pointer"
              />
            </div>
            <div className="space-y-4">
              {data.currentMedications.length === 0 ? (
                <p className="text-sm text-gray-500">No active medications.</p>
              ) : (
                data.currentMedications.map((med, index) => (
                  <MedicationItem
                    key={index}
                    name={med.name}
                    dosage={med.dosage}
                    frequency={med.frequency}
                    daysLeft={med.duration} // Using duration string for now as logic for daysLeft is complex
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ title, value, subtext, icon: Icon, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-gray-400">{subtext}</p>
    </div>
  );
}

function AppointmentItem({
  doctor,
  specialty,
  date,
  time,
  status,
  image,
}: any) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-50 bg-gray-50/50 p-4 transition-all hover:bg-white hover:shadow-sm hover:border-gray-100">
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
        <img src={image} alt={doctor} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{doctor}</h4>
        <p className="text-xs text-gray-500">{specialty}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{date}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
      <div
        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
          status === "confirmed"
            ? "bg-green-100 text-green-700"
            : status === "pending" || status === "requested"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </div>
    </div>
  );
}

function RecordRow({ name, date, doctor }: any) {
  return (
    <tr className="group border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="py-3 pl-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <FileText size={16} />
          </div>
          <span className="font-medium text-gray-700">{name}</span>
        </div>
      </td>
      <td className="py-3 text-gray-500">{date}</td>
      <td className="py-3 text-gray-500">{doctor}</td>
      <td className="py-3 text-right">
        <button className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}

function MedicationItem({ name, dosage, frequency, daysLeft }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-green-50 p-2 text-green-600">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
          <p className="text-xs text-gray-500">
            {dosage} • {frequency}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="block text-xs font-bold text-orange-500">
          {daysLeft}
        </span>
      </div>
    </div>
  );
}
