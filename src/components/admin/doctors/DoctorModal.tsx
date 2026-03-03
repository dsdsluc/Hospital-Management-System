'use client';

import { useEffect, useState } from 'react';

interface DoctorModalProps {
  open: boolean;
  onClose: () => void;
  doctor: {
    id: string;
    name: string;
    email: string;
    specialization: string | null;
    department: { id: string; name: string } | null;
    status?: string;
    licenseNumber?: string | null;
  } | null;
  onSubmit: (data: {
    email?: string;
    name: string;
    specialization: string;
    departmentId: string;
    licenseNumber?: string;
  }) => Promise<void> | void;
}

interface DepartmentOption { id: string; name: string }

export function DoctorModal({ open, onClose, doctor, onSubmit }: DoctorModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (doctor) {
      setEmail(doctor.email || '');
      setName(doctor.name || '');
      setSpecialization(doctor.specialization || '');
      setDepartmentId(doctor.department?.id || '');
      // If we had licenseNumber in the doctor prop, we would set it here.
      // For now, default to empty or fetch if needed (but the prop is simple).
      setLicenseNumber(doctor.licenseNumber || ''); 
    } else {
      setEmail('');
      setName('');
      setSpecialization('');
      setDepartmentId('');
      setLicenseNumber('');
    }
  }, [doctor, open]);

  useEffect(() => {
    if (!open) return;
    fetchDepartments();
  }, [open]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments');
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data; // Handle both {data: []} and [] formats
        setDepartments(list.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!name || !specialization || !departmentId) {
      // Basic validation
      // You might want to show an error message here
      return;
    }
    
    const payload: any = { name, specialization, departmentId };
    
    // If creating new doctor
    if (!doctor) {
      if (!email) return; // Email required for new
      payload.email = email;
      if (licenseNumber) payload.licenseNumber = licenseNumber;
    } else {
      // If editing existing
      if (licenseNumber) payload.licenseNumber = licenseNumber;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{doctor ? 'Edit Doctor' : 'Add Doctor'}</h2>
        </div>
        <div className="p-6 space-y-4">
          {!doctor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                className="w-full border rounded-lg px-3 py-2" 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input 
              value={specialization} 
              onChange={(e) => setSpecialization(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              value={departmentId} 
              onChange={(e) => setDepartmentId(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input 
              value={licenseNumber} 
              onChange={(e) => setLicenseNumber(e.target.value)} 
              className="w-full border rounded-lg px-3 py-2" 
              placeholder={doctor ? "(Leave blank to keep unchanged)" : ""}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
          >
            {doctor ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
