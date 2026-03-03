"use client";

import React, { useState, useEffect } from "react";
import {
  Pill,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Calendar,
  User,
  Loader2,
  Trash2,
  Edit2,
  X
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

// --- Types ---

interface Prescription {
  id: string;
  patient: {
    id: string;
    name: string;
    email: string;
    gender: string;
    dob: string;
  };
  medications: {
    name: string;
    dosage: string;
    freq: string;
    duration: string;
  }[];
  instructions: string;
  createdAt: string;
  status: string; // active, completed, cancelled
}

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

export default function PrescriptionsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patients, setPatients] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    medications: [{ name: "", dosage: "", freq: "", duration: "" }],
    instructions: "",
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [searchQuery]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      
      const res = await fetch(`/api/doctor/prescriptions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch prescriptions");
      const data = await res.json();
      setPrescriptions(data.data);
    } catch (error) {
      addToast("error", "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/doctor/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data.data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error("Failed to load patients", error);
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId && !editingId) {
        addToast("error", "Please select a patient");
        return;
    }

    try {
      const url = editingId
        ? `/api/doctor/prescriptions/${editingId}`
        : `/api/doctor/patients/${selectedPatientId}/prescriptions`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save prescription");
      
      addToast("success", editingId ? "Prescription updated" : "Prescription created");
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        medications: [{ name: "", dosage: "", freq: "", duration: "" }],
        instructions: "",
      });
      fetchPrescriptions();
    } catch (error) {
      addToast("error", "Failed to save prescription");
    }
  };

  const handleEdit = (p: Prescription) => {
    setEditingId(p.id);
    setSelectedPatientId(p.patient.id);
    setFormData({
      medications: p.medications,
      instructions: p.instructions || "",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Toast toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
            <p className="text-slate-500 mt-1">Manage patient medications and prescriptions</p>
          </div>
          <button 
            onClick={() => {
                setEditingId(null);
                setFormData({
                    medications: [{ name: "", dosage: "", freq: "", duration: "" }],
                    instructions: "",
                });
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={18} />
            New Prescription
          </button>
        </div>

        <div className="mt-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by patient name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
           <div className="flex items-center justify-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
           </div>
        ) : prescriptions.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-300">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
               <Pill className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">No prescriptions found</h3>
             <p className="text-slate-500 mt-1">Create a new prescription to get started</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {prescription.patient.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{prescription.patient.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <User size={12} />
                        {new Date().getFullYear() - new Date(prescription.patient.dob).getFullYear()} yrs • {prescription.patient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                     <button 
                        onClick={() => handleEdit(prescription)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                     >
                        <Edit2 size={16} />
                     </button>
                  </div>
                </div>

                {/* Medications List */}
                <div className="p-5 flex-1 space-y-3">
                   <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                     <Pill size={12} />
                     Medications
                   </div>
                   {prescription.medications.map((med, idx) => (
                     <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                            <p className="font-medium text-slate-800 text-sm">{med.name}</p>
                            <p className="text-xs text-slate-500">{med.dosage}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-700">{med.freq}</p>
                            <p className="text-[10px] text-slate-400">{med.duration}</p>
                        </div>
                     </div>
                   ))}
                   
                   {prescription.instructions && (
                     <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-500 mb-1">Instructions</p>
                        <p className="text-sm text-slate-600 italic line-clamp-2">"{prescription.instructions}"</p>
                     </div>
                   )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                   <div className="flex items-center gap-1">
                     <Calendar size={14} />
                     {new Date(prescription.createdAt).toLocaleDateString()}
                   </div>
                   <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                     Active
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-900">
                 {editingId ? "Edit Prescription" : "New Prescription"}
               </h2>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Patient Selection (Only for new) */}
                {!editingId && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                        <select 
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        >
                            <option value="">Select a patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <datalist id="common-medications-list">
                  {COMMON_MEDICATIONS.map((med) => (
                    <option key={med} value={med} />
                  ))}
                </datalist>

                {/* Medications */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700">Medications</label>
                        <button 
                            onClick={() => setFormData({
                                ...formData,
                                medications: [...formData.medications, { name: "", dosage: "", freq: "", duration: "" }]
                            })}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <Plus size={16} /> Add Another
                        </button>
                    </div>
                    
                    {formData.medications.map((med, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                            <button 
                                onClick={() => {
                                    const m = formData.medications.filter((_, i) => i !== idx);
                                    setFormData({ ...formData, medications: m });
                                }}
                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Medication Name</label>
                                    <input 
                                        list="common-medications-list"
                                        placeholder="e.g. Amoxicillin"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                        value={med.name}
                                        onChange={(e) => {
                                            const m = [...formData.medications];
                                            m[idx].name = e.target.value;
                                            setFormData({ ...formData, medications: m });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Dosage</label>
                                    <input 
                                        placeholder="e.g. 500mg"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                        value={med.dosage}
                                        onChange={(e) => {
                                            const m = [...formData.medications];
                                            m[idx].dosage = e.target.value;
                                            setFormData({ ...formData, medications: m });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Frequency</label>
                                    <input 
                                        placeholder="e.g. Twice daily"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                        value={med.freq}
                                        onChange={(e) => {
                                            const m = [...formData.medications];
                                            m[idx].freq = e.target.value;
                                            setFormData({ ...formData, medications: m });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Duration</label>
                                    <input 
                                        placeholder="e.g. 7 days"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                        value={med.duration}
                                        onChange={(e) => {
                                            const m = [...formData.medications];
                                            m[idx].duration = e.target.value;
                                            setFormData({ ...formData, medications: m });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instructions */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Special Instructions</label>
                    <textarea 
                        rows={3}
                        placeholder="e.g. Take with food..."
                        className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={formData.instructions}
                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    />
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                    {editingId ? "Update Prescription" : "Create Prescription"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
