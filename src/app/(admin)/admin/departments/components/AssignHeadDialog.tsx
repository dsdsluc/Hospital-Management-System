"use client";

import { Select } from "@/components/ui/Select";
import { useState } from "react";
import type { DepartmentListItem } from "@/types/departments";
import type { DoctorListItem } from "@/lib/services/admin/doctors.client";

export function AssignHeadDialog({
  open,
  onClose,
  department,
  doctors,
  onAssign,
}: {
  open: boolean;
  onClose: () => void;
  department: DepartmentListItem | null;
  doctors: DoctorListItem[];
  onAssign: (doctorId: string | null) => Promise<void> | void;
}) {
  const [doctorId, setDoctorId] = useState<string>("");

  const resetAndClose = () => {
    setDoctorId("");
    onClose();
  };

  if (!open || !department) return null;

  const departmentDoctors = doctors.filter((d) => true); // assume server filtered list passed or all doctors shown

  const submit = async () => {
    await onAssign(doctorId || null);
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          Assign Head — {department.name}
        </h2>
        <Select
          value={doctorId}
          onChange={setDoctorId}
          placeholder="Select Doctor"
          options={departmentDoctors.map((d) => ({
            value: d.id,
            label: `Dr. ${d.name}`,
          }))}
        />
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={resetAndClose} className="px-3 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-3 py-2 bg-purple-600 text-white rounded"
            disabled={!doctorId}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
