"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  UserX,
  AlertTriangle,
  UserCheck,
  FileText,
  Pill,
  TestTube,
  Stethoscope,
  Plus,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [clinicalData, setClinicalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toasts, addToast, removeToast } = useToast();

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [testResultModalOpen, setTestResultModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Form States
  const [newPrescription, setNewPrescription] = useState({
    doctorId: "",
    medications: [{ name: "", dosage: "", freq: "", duration: "" }],
    instructions: "",
  });

  const [newTestResult, setNewTestResult] = useState({
    orderedByDoctorId: "",
    type: "",
    resultSummary: "",
    reportedAt: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchPatient();
    fetchClinicalData();
    fetchDoctors();
  }, [params.id]);

  const fetchPatient = async () => {
    try {
      const res = await fetch(`/api/admin/patients/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch patient");
      const data = await res.json();
      setPatient(data);
    } catch (error) {
      addToast("error", "Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicalData = async () => {
    try {
      const res = await fetch(`/api/patients/${params.id}/clinical`);
      if (!res.ok) throw new Error("Failed to fetch clinical data");
      const data = await res.json();
      setClinicalData(data);
    } catch (error) {
      console.error("Failed to load clinical data", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/admin/doctors?status=ACTIVE&limit=100");
      if (!res.ok) return;
      const data = await res.json();
      setDoctors(data.data);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    }
  };

  const handleCreatePrescription = async () => {
    try {
      const res = await fetch(
        `/api/admin/patients/${params.id}/prescriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPrescription),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create prescription");
      }

      addToast("success", "Prescription created successfully");
      setPrescriptionModalOpen(false);
      fetchClinicalData();
      setNewPrescription({
        doctorId: "",
        medications: [{ name: "", dosage: "", freq: "", duration: "" }],
        instructions: "",
      });
    } catch (error: any) {
      addToast("error", error.message);
    }
  };

  const handleCreateTestResult = async () => {
    try {
      const res = await fetch(`/api/admin/patients/${params.id}/test-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTestResult),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create test result");
      }

      addToast("success", "Test result created successfully");
      setTestResultModalOpen(false);
      fetchClinicalData();
      setNewTestResult({
        orderedByDoctorId: "",
        type: "",
        resultSummary: "",
        reportedAt: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      addToast("error", error.message);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setConfirmDialog({
      open: true,
      title: "Update Status",
      message: `Are you sure you want to change the status to ${newStatus}?`,
      type: "warning",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/patients/${params.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });

          if (!res.ok) throw new Error("Failed to update status");

          addToast("success", "Status updated successfully");
          fetchPatient();
        } catch (error) {
          addToast("error", "Failed to update status");
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: "Delete Patient",
      message:
        "Are you sure you want to delete this patient? This action is irreversible.",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/patients/${params.id}`, {
            method: "DELETE",
          });

          if (!res.ok) throw new Error("Failed to delete patient");

          addToast("success", "Patient deleted successfully");
          router.push("/admin/patients");
        } catch (error) {
          addToast("error", "Failed to delete patient");
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (!patient) return <div>Patient not found</div>;

  // Flatten data for specific tabs
  const prescriptions = clinicalData.flatMap((r) => r.prescriptions || []);
  const testResults = clinicalData.flatMap((r) => r.testResults || []);

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Patients
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-500">
            <Mail className="w-4 h-4" />
            <span>{patient.email}</span>
            <span className="mx-1">•</span>
            <StatusBadge status={patient.status} />
          </div>
        </div>
        <div className="flex gap-2">
          {patient.status !== "DEACTIVATED" && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2"
            >
              <UserX className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {["overview", "medical-records", "prescriptions", "test-results"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            ),
          )}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Gender
                  </label>
                  <div className="mt-1 text-gray-900 capitalize">
                    {patient.gender?.toLowerCase() || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Date of Birth
                  </label>
                  <div className="mt-1 text-gray-900">
                    {patient.dob
                      ? new Date(patient.dob).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Contact
                  </label>
                  <div className="mt-1 text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {patient.contact || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <div className="mt-1 text-gray-900">
                    {patient.address || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Emergency Contact
              </h3>
              <div className="text-gray-900">
                {patient.emergencyContact || "Not provided"}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Care Team
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Primary Doctor
                </label>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      {patient.primaryDoctor?.name?.charAt(0) || "?"}
                    </div>
                    <span className="font-medium text-gray-900">
                      {patient.primaryDoctor?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange("ACTIVE")}
                  disabled={patient.status === "ACTIVE"}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border ${
                    patient.status === "ACTIVE"
                      ? "bg-green-50 border-green-200 text-green-700 cursor-default"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Active
                  </span>
                  {patient.status === "ACTIVE" && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>

                <button
                  onClick={() => handleStatusChange("SUSPENDED")}
                  disabled={patient.status === "SUSPENDED"}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border ${
                    patient.status === "SUSPENDED"
                      ? "bg-orange-50 border-orange-200 text-orange-700 cursor-default"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Suspended
                  </span>
                  {patient.status === "SUSPENDED" && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "medical-records" && (
        <div className="space-y-4">
          {clinicalData.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
              No medical records found
            </div>
          ) : (
            clinicalData.map((record) => (
              <div
                key={record.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {record.diagnosis}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()} •{" "}
                        {record.doctorName}
                      </p>
                    </div>
                  </div>
                </div>
                {record.allergies && (
                  <div className="mt-3 text-sm text-gray-600 pl-12">
                    <span className="font-medium">Allergies:</span>{" "}
                    {record.allergies}
                  </div>
                )}
                {record.vitals && (
                  <div className="mt-2 text-sm text-gray-600 pl-12 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(record.vitals).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 px-2 py-1 rounded">
                        <span className="font-medium capitalize">{key}:</span>{" "}
                        {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setPrescriptionModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Prescription
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
              No prescriptions found
            </div>
          ) : (
            prescriptions.map((script: any) => (
              <div
                key={script.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Pill size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {script.medications.map((m: any) => m.name).join(", ")}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Prescribed on{" "}
                      {new Date(script.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      {script.instructions ||
                        script.medications
                          .map((m: any) => `${m.name}: ${m.dosage} ${m.freq}`)
                          .join("; ")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "test-results" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setTestResultModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Test Result
            </button>
          </div>

          {testResults.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
              No test results found
            </div>
          ) : (
            testResults.map((result: any) => (
              <div
                key={result.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <TestTube size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{result.type}</h4>
                    <p className="text-sm text-gray-500">
                      Reported on{" "}
                      {new Date(result.reportedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {result.resultSummary ||
                        "Results pending or file attached"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Prescription Modal */}
      {prescriptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add Prescription</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescribing Doctor
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newPrescription.doctorId}
                  onChange={(e) =>
                    setNewPrescription({
                      ...newPrescription,
                      doctorId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medications
                </label>
                {newPrescription.medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-2 gap-2 mb-2 p-2 bg-gray-50 rounded"
                  >
                    <input
                      placeholder="Name (e.g. Amoxicillin)"
                      className="border rounded p-1 text-sm"
                      value={med.name}
                      onChange={(e) => {
                        const newMeds = [...newPrescription.medications];
                        newMeds[idx].name = e.target.value;
                        setNewPrescription({
                          ...newPrescription,
                          medications: newMeds,
                        });
                      }}
                    />
                    <input
                      placeholder="Dosage (e.g. 500mg)"
                      className="border rounded p-1 text-sm"
                      value={med.dosage}
                      onChange={(e) => {
                        const newMeds = [...newPrescription.medications];
                        newMeds[idx].dosage = e.target.value;
                        setNewPrescription({
                          ...newPrescription,
                          medications: newMeds,
                        });
                      }}
                    />
                    <input
                      placeholder="Freq (e.g. 2x/day)"
                      className="border rounded p-1 text-sm"
                      value={med.freq}
                      onChange={(e) => {
                        const newMeds = [...newPrescription.medications];
                        newMeds[idx].freq = e.target.value;
                        setNewPrescription({
                          ...newPrescription,
                          medications: newMeds,
                        });
                      }}
                    />
                    <input
                      placeholder="Duration (e.g. 7 days)"
                      className="border rounded p-1 text-sm"
                      value={med.duration}
                      onChange={(e) => {
                        const newMeds = [...newPrescription.medications];
                        newMeds[idx].duration = e.target.value;
                        setNewPrescription({
                          ...newPrescription,
                          medications: newMeds,
                        });
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() =>
                    setNewPrescription({
                      ...newPrescription,
                      medications: [
                        ...newPrescription.medications,
                        { name: "", dosage: "", freq: "", duration: "" },
                      ],
                    })
                  }
                >
                  + Add Another Medication
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  value={newPrescription.instructions}
                  onChange={(e) =>
                    setNewPrescription({
                      ...newPrescription,
                      instructions: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setPrescriptionModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrescription}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Result Modal */}
      {testResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">Add Test Result</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordered By
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newTestResult.orderedByDoctorId}
                  onChange={(e) =>
                    setNewTestResult({
                      ...newTestResult,
                      orderedByDoctorId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type
                </label>
                <input
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="e.g. Blood Count, X-Ray"
                  value={newTestResult.type}
                  onChange={(e) =>
                    setNewTestResult({ ...newTestResult, type: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result Summary
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  value={newTestResult.resultSummary}
                  onChange={(e) =>
                    setNewTestResult({
                      ...newTestResult,
                      resultSummary: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reported At
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newTestResult.reportedAt}
                  onChange={(e) =>
                    setNewTestResult({
                      ...newTestResult,
                      reportedAt: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setTestResultModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTestResult}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save Result
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmButtonClassName={
          confirmDialog.type === "danger"
            ? "bg-red-600 hover:bg-red-700"
            : confirmDialog.type === "warning"
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
        }
      />
    </div>
  );
}
