"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  User,
  Pill,
  TestTube,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Stethoscope,
  Loader2,
  X,
  FileText,
  Trash2,
  Eye,
  Edit2,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

// --- Constants ---
const COMMON_MEDICATIONS = [
  "Amoxicillin",
  "Ibuprofen",
  "Lisinopril",
  "Metformin",
  "Atorvastatin",
  "Amlodipine",
  "Metoprolol",
  "Omeprazole",
  "Losartan",
  "Albuterol",
  "Gabapentin",
  "Hydrochlorothiazide",
  "Sertraline",
  "Simvastatin",
  "Montelukast",
  "Escitalopram",
  "Acetaminophen",
  "Prednisone",
  "Furosemide",
  "Levothyroxine",
];

// --- Types ---

interface Patient {
  id: string;
  name: string;
  email: string;
  gender: string;
  dob: string;
  lastVisit: string | null;
  condition: string;
  avatar: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  allergies?: string;
  vitals?: any;
  doctorName: string;
  filesRef?: string;
  prescriptions: any[];
  testResults: any[];
}

// --- Components ---

const TabButton = ({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
      ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
      }
    `}
  >
    {icon}
    {label}
  </button>
);

const RecordCard = ({
  item,
  type,
  onViewDetail,
  onEdit,
}: {
  item: any;
  type: string;
  onViewDetail: (item: any) => void;
  onEdit?: (item: any) => void;
}) => {
  const iconMap: any = {
    History: <Clock className="w-4 h-4 text-slate-500" />,
    Diagnosis: <Stethoscope className="w-4 h-4 text-blue-500" />,
    Prescription: <Pill className="w-4 h-4 text-emerald-500" />,
    Lab: <TestTube className="w-4 h-4 text-purple-500" />,
  };

  let title = "";
  let description = "";
  let date = "";
  let doctor = "";

  if (type === "Diagnosis" || type === "History") {
    title = item.diagnosis;
    description = `Allergies: ${item.allergies || "None"}`;
    date = new Date(item.date).toLocaleDateString();
    doctor = item.doctorName;
  } else if (type === "Prescription") {
    const meds = item.medications as any[];
    title = meds.map((m: any) => m.name).join(", ");
    description =
      item.instructions ||
      meds.map((m: any) => `${m.dosage} ${m.freq}`).join(", ");
    date = new Date(item.createdAt).toLocaleDateString();
    doctor = "Dr. " + (item.doctor?.name || "Unknown");
  } else if (type === "Lab") {
    title = item.type;
    description = item.resultSummary || "Pending results";
    date = new Date(item.reportedAt).toLocaleDateString();
    doctor = "Ordered by " + (item.orderedByDoctor?.name || "Unknown");
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            {iconMap[type] || <Clock className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
            <span className="text-xs text-slate-500">
              {date} • {doctor}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (type === "Prescription" || type === "Lab") && (
            <button
              onClick={() => onEdit(item)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
          )}
          <button
            onClick={() => onViewDetail(item)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-600 pl-11 line-clamp-2">{description}</p>
    </div>
  );
};

// --- Modals ---

const AddRecordModal = ({
  isOpen,
  onClose,
  onSelectType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: "record" | "prescription" | "lab") => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Add New Record</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Select the type of record you want to create for this patient.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onSelectType("record")}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">
                Consultation Note
              </h4>
              <p className="text-xs text-slate-500">
                Add diagnosis, allergies, and vitals
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectType("prescription")}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
          >
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Pill size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Prescription</h4>
              <p className="text-xs text-slate-500">
                Prescribe medications and instructions
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectType("lab")}
            className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
          >
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <TestTube size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Test Result</h4>
              <p className="text-xs text-slate-500">
                Record lab results or diagnostic reports
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Page Component ---

export default function ClinicalPage() {
  const { toasts, addToast, removeToast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "History" | "Diagnosis" | "Prescription" | "Lab"
  >("Diagnosis");
  const [searchQuery, setSearchQuery] = useState("");

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    type: string;
    item: any;
  }>({ open: false, type: "", item: null });
  const [activeModal, setActiveModal] = useState<
    "record" | "prescription" | "lab" | null
  >(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Forms
  const [newRecord, setNewRecord] = useState({
    diagnosis: "",
    allergies: "",
    vitals: {},
  });
  const [newPrescription, setNewPrescription] = useState({
    medications: [{ name: "", dosage: "", freq: "", duration: "" }],
    instructions: "",
  });
  const [newTestResult, setNewTestResult] = useState({
    type: "",
    resultSummary: "",
    reportedAt: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchRecords(selectedPatientId);
    } else if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [selectedPatientId, patients]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/doctor/patients?${params}`);
      if (!res.ok) throw new Error("Failed to fetch patients");

      const data = await res.json();
      setPatients(data.data);
    } catch (error) {
      console.error(error);
      addToast("error", "Failed to load patients");
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchRecords = async (patientId: string) => {
    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/clinical`);
      if (!res.ok) throw new Error("Failed to fetch clinical data");
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error(error);
      addToast("error", "Failed to load clinical records");
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleCreateRecord = async () => {
    try {
      const res = await fetch(
        `/api/doctor/patients/${selectedPatientId}/records`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord),
        },
      );
      if (!res.ok) throw new Error("Failed");
      addToast("success", "Note added successfully");
      setActiveModal(null);
      fetchRecords(selectedPatientId!);
      setNewRecord({ diagnosis: "", allergies: "", vitals: {} });
    } catch (e) {
      addToast("error", "Failed to add record");
    }
  };

  const handleCreatePrescription = async () => {
    try {
      const url = editingId
        ? `/api/doctor/prescriptions/${editingId}`
        : `/api/doctor/patients/${selectedPatientId}/prescriptions`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrescription),
      });

      if (!res.ok) throw new Error("Failed");
      addToast(
        "success",
        editingId ? "Prescription updated" : "Prescription added",
      );
      setActiveModal(null);
      setEditingId(null);
      fetchRecords(selectedPatientId!);
      setNewPrescription({
        medications: [{ name: "", dosage: "", freq: "", duration: "" }],
        instructions: "",
      });
    } catch (e) {
      addToast("error", "Failed to save prescription");
    }
  };

  const handleCreateTestResult = async () => {
    try {
      const url = editingId
        ? `/api/doctor/test-results/${editingId}`
        : `/api/doctor/patients/${selectedPatientId}/test-results`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTestResult),
      });

      if (!res.ok) throw new Error("Failed");
      addToast("success", editingId ? "Result updated" : "Result added");
      setActiveModal(null);
      setEditingId(null);
      fetchRecords(selectedPatientId!);
      setNewTestResult({
        type: "",
        resultSummary: "",
        reportedAt: new Date().toISOString().split("T")[0],
      });
    } catch (e) {
      addToast("error", "Failed to save result");
    }
  };

  const handleEdit = (item: any, type: string) => {
    if (type === "Prescription") {
      setNewPrescription({
        medications: item.medications,
        instructions: item.instructions || "",
      });
      setEditingId(item.id);
      setActiveModal("prescription");
    } else if (type === "Lab") {
      setNewTestResult({
        type: item.type,
        resultSummary: item.resultSummary,
        reportedAt: item.reportedAt.split("T")[0],
      });
      setEditingId(item.id);
      setActiveModal("lab");
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const getAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getDisplayItems = () => {
    if (!records) return [];
    switch (activeTab) {
      case "Diagnosis":
      case "History":
        return records.slice(0, 5); // Only show 5 recent diagnosis
      case "Prescription":
        return records
          .flatMap((r) => r.prescriptions || [])
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      case "Lab":
        return records
          .flatMap((r) => r.testResults || [])
          .sort(
            (a: any, b: any) =>
              new Date(b.reportedAt).getTime() -
              new Date(a.reportedAt).getTime(),
          );
      default:
        return [];
    }
  };

  const displayItems = getDisplayItems();

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-full">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Left Panel: Patient List */}
      <div className="w-full lg:w-80 border-r border-slate-200 bg-white flex flex-col h-full z-10">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingPatients ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No patients found
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`
                    p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50
                    ${selectedPatientId === patient.id ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"}
                  `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedPatientId === patient.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {patient.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold ${selectedPatientId === patient.id ? "text-blue-900" : "text-slate-800"}`}
                    >
                      {patient.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {patient.condition}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${selectedPatientId === patient.id ? "text-blue-400" : "text-slate-300"}`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Patient Details & Records */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
        {selectedPatient ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                    {selectedPatient.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedPatient.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />{" "}
                        {selectedPatient.gender}, {getAge(selectedPatient.dob)}{" "}
                        yrs
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs">ID: {selectedPatient.id}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>
                        Last Visit:{" "}
                        {selectedPatient.lastVisit
                          ? new Date(
                              selectedPatient.lastVisit,
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
                    <MoreHorizontal className="w-4 h-4" />
                    More
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Record
                  </button>
                </div>
              </div>

              <div className="mt-8 border-b border-slate-200 flex gap-6 overflow-x-auto no-scrollbar">
                <TabButton
                  label="Medical History"
                  active={activeTab === "History"}
                  onClick={() => setActiveTab("History")}
                  icon={<Clock className="w-4 h-4" />}
                />
                <TabButton
                  label="Diagnoses"
                  active={activeTab === "Diagnosis"}
                  onClick={() => setActiveTab("Diagnosis")}
                  icon={<Stethoscope className="w-4 h-4" />}
                />
                <TabButton
                  label="Prescriptions"
                  active={activeTab === "Prescription"}
                  onClick={() => setActiveTab("Prescription")}
                  icon={<Pill className="w-4 h-4" />}
                />
                <TabButton
                  label="Lab Results"
                  active={activeTab === "Lab"}
                  onClick={() => setActiveTab("Lab")}
                  icon={<TestTube className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {activeTab}
                </h3>
              </div>

              {loadingRecords ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {displayItems.length > 0 ? (
                    displayItems.map((item: any) => (
                      <RecordCard
                        key={item.id}
                        item={item}
                        type={activeTab}
                        onEdit={(item) => handleEdit(item, activeTab)}
                        onViewDetail={(item) =>
                          setDetailModal({ open: true, type: activeTab, item })
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-400">
                        No records found for this section.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            Select a patient to view details
          </div>
        )}
      </div>

      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectType={(type) => {
          setIsAddModalOpen(false);
          setActiveModal(type);
        }}
      />

      {/* Input Modals */}
      {/* Detail Modal */}
      {detailModal.open && detailModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-slate-900">
                {detailModal.type} Details
              </h3>
              <button
                onClick={() =>
                  setDetailModal({ open: false, type: "", item: null })
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {(detailModal.type === "Diagnosis" ||
                detailModal.type === "History") && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Diagnosis
                    </label>
                    <p className="text-slate-900 font-medium">
                      {detailModal.item.diagnosis}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Allergies
                    </label>
                    <p className="text-slate-900">
                      {detailModal.item.allergies || "None"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Vitals
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {detailModal.item.vitals ? (
                        Object.entries(detailModal.item.vitals).map(
                          ([k, v]) => (
                            <div
                              key={k}
                              className="bg-slate-50 p-2 rounded border text-sm"
                            >
                              <span className="capitalize text-slate-500">
                                {k}:
                              </span>{" "}
                              <span className="font-medium">{String(v)}</span>
                            </div>
                          ),
                        )
                      ) : (
                        <p className="text-slate-500 text-sm">
                          No vitals recorded
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Date & Doctor
                    </label>
                    <p className="text-slate-700 text-sm">
                      {new Date(detailModal.item.date).toLocaleDateString()} •{" "}
                      {detailModal.item.doctorName}
                    </p>
                  </div>
                </>
              )}

              {detailModal.type === "Prescription" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Medications
                    </label>
                    <div className="space-y-2 mt-1">
                      {detailModal.item.medications.map(
                        (m: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-green-50 p-3 rounded-lg border border-green-100"
                          >
                            <p className="font-bold text-green-800">{m.name}</p>
                            <p className="text-sm text-green-700">
                              {m.dosage} • {m.freq} • {m.duration}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Instructions
                    </label>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded mt-1 text-sm">
                      {detailModal.item.instructions || "None"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Prescribed By
                    </label>
                    <p className="text-slate-700 text-sm">
                      Dr. {detailModal.item.doctor?.name} on{" "}
                      {new Date(
                        detailModal.item.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}

              {detailModal.type === "Lab" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Test Type
                    </label>
                    <p className="text-slate-900 font-medium">
                      {detailModal.item.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Results
                    </label>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded mt-1 text-sm whitespace-pre-wrap">
                      {detailModal.item.resultSummary}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">
                      Reported Details
                    </label>
                    <p className="text-slate-700 text-sm">
                      {new Date(
                        detailModal.item.reportedAt,
                      ).toLocaleDateString()}{" "}
                      • Ordered by {detailModal.item.orderedByDoctor?.name}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                onClick={() =>
                  setDetailModal({ open: false, type: "", item: null })
                }
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "record" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">New Consultation Note</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Diagnosis
                </label>
                <input
                  className="w-full border rounded-md p-2"
                  value={newRecord.diagnosis}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, diagnosis: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Allergies
                </label>
                <input
                  className="w-full border rounded-md p-2"
                  value={newRecord.allergies}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, allergies: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecord}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "prescription" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">New Prescription</h3>

            <datalist id="common-medications">
              {COMMON_MEDICATIONS.map((med) => (
                <option key={med} value={med} />
              ))}
            </datalist>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Medications
                </label>
                {newPrescription.medications.map((med, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
                      <div className="md:col-span-1">
                        <input
                          list="common-medications"
                          placeholder="Name"
                          className="w-full border rounded p-2 text-sm"
                          value={med.name}
                          onChange={(e) => {
                            const m = [...newPrescription.medications];
                            m[idx].name = e.target.value;
                            setNewPrescription({
                              ...newPrescription,
                              medications: m,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <input
                          placeholder="Dosage (e.g. 500mg)"
                          className="w-full border rounded p-2 text-sm"
                          value={med.dosage}
                          onChange={(e) => {
                            const m = [...newPrescription.medications];
                            m[idx].dosage = e.target.value;
                            setNewPrescription({
                              ...newPrescription,
                              medications: m,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <input
                          placeholder="Freq (e.g. 2x/day)"
                          className="w-full border rounded p-2 text-sm"
                          value={med.freq}
                          onChange={(e) => {
                            const m = [...newPrescription.medications];
                            m[idx].freq = e.target.value;
                            setNewPrescription({
                              ...newPrescription,
                              medications: m,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <input
                          placeholder="Duration (e.g. 7 days)"
                          className="w-full border rounded p-2 text-sm"
                          value={med.duration}
                          onChange={(e) => {
                            const m = [...newPrescription.medications];
                            m[idx].duration = e.target.value;
                            setNewPrescription({
                              ...newPrescription,
                              medications: m,
                            });
                          }}
                        />
                      </div>
                    </div>
                    {newPrescription.medications.length > 1 && (
                      <button
                        onClick={() => {
                          const m = newPrescription.medications.filter(
                            (_, i) => i !== idx,
                          );
                          setNewPrescription({
                            ...newPrescription,
                            medications: m,
                          });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove medication"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() =>
                    setNewPrescription({
                      ...newPrescription,
                      medications: [
                        ...newPrescription.medications,
                        { name: "", dosage: "", freq: "", duration: "" },
                      ],
                    })
                  }
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  Add Another Medication
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Instructions / Notes
                </label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  placeholder="Additional instructions for the patient..."
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
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrescription}
                disabled={newPrescription.medications.some((m) => !m.name)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "lab" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">New Test Result</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Test Type
                </label>
                <input
                  className="w-full border rounded-md p-2"
                  value={newTestResult.type}
                  onChange={(e) =>
                    setNewTestResult({ ...newTestResult, type: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Result Summary
                </label>
                <textarea
                  className="w-full border rounded-md p-2"
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
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTestResult}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Save Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
