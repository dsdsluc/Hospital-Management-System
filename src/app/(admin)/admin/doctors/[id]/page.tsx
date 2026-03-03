"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { DoctorPatientsTab } from "@/components/admin/doctors/DoctorPatientsTab";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  Building,
} from "lucide-react";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchDoctor();
  }, [params.id]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/admin/doctors/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch doctor");
      const data = await res.json();
      setDoctor(data);
    } catch (error) {
      addToast("error", "Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (!doctor) return <div>Doctor not found</div>;

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Doctors
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-500">
            <Mail className="w-4 h-4" />
            <span>{doctor.email}</span>
            <span className="mx-1">•</span>
            <StatusBadge status={doctor.status} />
          </div>
        </div>
        <div className="flex gap-2">{/* Action buttons could go here */}</div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("patients")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "patients"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Patients
          </button>
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Professional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Department
              </label>
              <div className="mt-1 flex items-center text-gray-900">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                {doctor.department?.name || "Not Assigned"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Specialization
              </label>
              <div className="mt-1 flex items-center text-gray-900">
                <Award className="w-4 h-4 mr-2 text-gray-400" />
                {doctor.specialization || "Not Specified"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Joined Date
              </label>
              <div className="mt-1 flex items-center text-gray-900">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {new Date(doctor.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "patients" && <DoctorPatientsTab doctorId={doctor.id} />}
    </div>
  );
}
