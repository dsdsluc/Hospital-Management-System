"use client";

import Input from "@/components/ui/Input";
import { useEffect, useState } from "react";
import type { DepartmentListItem } from "@/types/departments";

export function DepartmentModal({
  open,
  onClose,
  department,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  department: DepartmentListItem | null;
  onSubmit: (payload: {
    name: string;
    description?: string;
  }) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [department, open]);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name, description: description || undefined });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {department ? "Edit Department" : "Add Department"}
        </h2>
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-2 border rounded">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            {department ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
