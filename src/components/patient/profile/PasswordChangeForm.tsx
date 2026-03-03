import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { changePassword } from "@/lib/services/patient.client";
import { Loader2 } from "lucide-react";

interface PasswordChangeFormProps {
  addToast: (type: "success" | "error" | "info", message: string) => void;
}

export function PasswordChangeForm({ addToast }: PasswordChangeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      addToast("error", "New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      addToast("error", "Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      addToast("success", "Password updated successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Failed to update password", error);
      addToast("error", error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="currentPassword"
            className="text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500">
            Must be at least 8 characters.
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </div>
    </form>
  );
}
