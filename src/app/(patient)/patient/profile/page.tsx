"use client";

import React from "react";
import { PageHeader } from "@/components/patient/shared/PageHeader";
import { ProfileForm } from "@/components/patient/profile/ProfileForm";
import { PasswordChangeForm } from "@/components/patient/profile/PasswordChangeForm";
import { Card } from "@/components/patient/shared/Card";
import { User, Lock } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal information and security settings."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-500">Update your contact details and address.</p>
              </div>
            </div>
            <ProfileForm addToast={addToast} />
          </Card>
        </div>

        {/* Right Column: Security */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Change your password.</p>
              </div>
            </div>
            <PasswordChangeForm addToast={addToast} />
          </Card>
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
