import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
            <AlertTriangle size={24} />
          </div>
          <h3 className="mb-2 text-center text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-center text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-6 py-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            {cancelText}
          </Button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
