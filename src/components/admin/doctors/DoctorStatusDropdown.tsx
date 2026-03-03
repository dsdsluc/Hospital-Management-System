"use client";

import { useState } from "react";
import { UserStatus } from "@prisma/client";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { Check, X, AlertTriangle, ChevronDown } from "lucide-react";

interface StatusDropdownProps {
  currentStatus: UserStatus;
  onStatusChange: (newStatus: UserStatus) => Promise<void>;
  loading?: boolean;
}

const allowedTransitions: Record<UserStatus, UserStatus[]> = {
  [UserStatus.PENDING_APPROVAL]: [UserStatus.ACTIVE, UserStatus.DEACTIVATED],
  [UserStatus.ACTIVE]: [UserStatus.SUSPENDED, UserStatus.DEACTIVATED],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.DEACTIVATED],
  [UserStatus.DEACTIVATED]: [],
};

const statusColors: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: "bg-green-100 text-green-800",
  [UserStatus.SUSPENDED]: "bg-orange-100 text-orange-800",
  [UserStatus.PENDING_APPROVAL]: "bg-blue-100 text-blue-800",
  [UserStatus.DEACTIVATED]: "bg-gray-100 text-gray-800",
};

export function DoctorStatusDropdown({
  currentStatus,
  onStatusChange,
  loading,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    status: UserStatus | null;
  }>({ open: false, status: null });

  const availableOptions = allowedTransitions[currentStatus] || [];

  const handleSelect = (status: UserStatus) => {
    setConfirmDialog({ open: true, status });
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    if (confirmDialog.status) {
      await onStatusChange(confirmDialog.status);
    }
    setConfirmDialog({ open: false, status: null });
  };

  if (availableOptions.length === 0) {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]}`}
      >
        {currentStatus.replace("_", " ")}
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className={`inline-flex justify-center items-center w-full px-3 py-1.5 rounded-md border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            statusColors[currentStatus]
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Updating..." : currentStatus.replace("_", " ")}
          <ChevronDown className="-mr-1 ml-2 h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {availableOptions.map((status) => (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {status === UserStatus.ACTIVE && "Activate"}
                {status === UserStatus.SUSPENDED && "Suspend"}
                {status === UserStatus.DEACTIVATED && "Deactivate"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, status: null })}
        onConfirm={handleConfirm}
        title={`Confirm Status Change`}
        message={`Are you sure you want to change the status from ${currentStatus} to ${confirmDialog.status}?`}
        confirmButtonClassName={
          confirmDialog.status === UserStatus.DEACTIVATED
            ? "bg-red-600 hover:bg-red-700"
            : confirmDialog.status === UserStatus.SUSPENDED
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
        }
      />
    </div>
  );
}
