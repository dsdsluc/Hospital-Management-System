"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Shield, 
  Bell, 
  Save, 
  Loader2,
  Globe,
  Mail,
  Phone,
  Lock,
  Clock,
  AlertTriangle
} from "lucide-react";
import { SystemSettings } from "@/types/settings";
import { getAdminSettings, updateAdminSettings } from "@/lib/services/settings.client";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

type Tab = "general" | "security" | "notifications";

export default function AdminSettingsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getAdminSettings();
      setSettings(data);
    } catch (error) {
      addToast("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateAdminSettings(settings);
      addToast("success", "Settings saved successfully");
    } catch (error) {
      addToast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">Configure global application preferences and policies.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Building2 size={18} />
          General
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Shield size={18} />
          Security
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "notifications"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          <Bell size={18} />
          Notifications
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {activeTab === "general" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Hospital Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={settings.general.hospitalName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, hospitalName: e.target.value }
                    })}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="url"
                    value={settings.general.website}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, website: e.target.value }
                    })}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, contactEmail: e.target.value }
                    })}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={settings.general.contactPhone}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, contactPhone: e.target.value }
                    })}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <textarea
                  rows={3}
                  value={settings.general.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, address: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Session Timeout (Minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={settings.security.sessionTimeoutMinutes}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeoutMinutes: parseInt(e.target.value) || 30 }
                    })}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500">Automatically log out inactive users.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Max Login Attempts</label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="number"
                    min={3}
                    max={10}
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) || 5 }
                    })}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500">Lock account after failed attempts.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Minimum Password Length</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="number"
                    min={6}
                    max={32}
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordMinLength: parseInt(e.target.value) || 8 }
                    })}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <input
                  type="checkbox"
                  id="specialChar"
                  checked={settings.security.requireSpecialChar}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, requireSpecialChar: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="specialChar" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Require Special Characters
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-slate-900 block">Email Alerts</label>
                  <p className="text-xs text-slate-500">Send email notifications for critical system events.</p>
                </div>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.enableEmailAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, enableEmailAlerts: e.target.checked }
                    })}
                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer translate-x-0 checked:translate-x-4 checked:border-blue-600"
                    style={{ right: settings.notifications.enableEmailAlerts ? 0 : 'auto', left: settings.notifications.enableEmailAlerts ? 'auto' : 0 }}
                  />
                  <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.notifications.enableEmailAlerts ? 'bg-blue-600' : 'bg-slate-300'}`}></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-slate-900 block">SMS Alerts</label>
                  <p className="text-xs text-slate-500">Send SMS notifications to administrators.</p>
                </div>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.enableSmsAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, enableSmsAlerts: e.target.checked }
                    })}
                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer translate-x-0 checked:translate-x-4 checked:border-blue-600"
                    style={{ right: settings.notifications.enableSmsAlerts ? 0 : 'auto', left: settings.notifications.enableSmsAlerts ? 'auto' : 0 }}
                  />
                  <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.notifications.enableSmsAlerts ? 'bg-blue-600' : 'bg-slate-300'}`}></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-amber-900 block">Maintenance Mode</label>
                  <p className="text-xs text-amber-600">Disable access for non-admin users.</p>
                </div>
                <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    checked={settings.notifications.systemMaintenanceMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, systemMaintenanceMode: e.target.checked }
                    })}
                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer translate-x-0 checked:translate-x-4 checked:border-amber-600"
                    style={{ right: settings.notifications.systemMaintenanceMode ? 0 : 'auto', left: settings.notifications.systemMaintenanceMode ? 'auto' : 0 }}
                  />
                  <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.notifications.systemMaintenanceMode ? 'bg-amber-600' : 'bg-slate-300'}`}></label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
