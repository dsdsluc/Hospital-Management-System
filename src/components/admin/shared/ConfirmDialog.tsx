import React from "react";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

export function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClassName = "bg-red-600 hover:bg-red-700",
  cancelButtonClassName = "bg-gray-300 hover:bg-gray-400 text-gray-700",
}: ConfirmDialogProps) {
  const visible = open ?? isOpen ?? false;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="text-gray-600 mb-6">{message}</div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${cancelButtonClassName}`}
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 rounded-md font-medium text-white transition-colors ${confirmButtonClassName}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
