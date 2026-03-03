"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Clock, 
  Bell, 
  Shield, 
  Save,
  Check,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { getDoctorProfile, updateDoctorProfile, updateDoctorSchedule } from '@/lib/services/doctor.client';
import { getJson } from '@/lib/services/http';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

// --- Components ---

const SettingSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
      <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
);

const ToggleSwitch = ({ label, description, checked, onChange }: { label: string, description?: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-900">{label}</p>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
    <button 
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20
        ${checked ? 'bg-blue-600' : 'bg-slate-200'}
      `}
    >
      <span className={`
        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
        ${checked ? 'translate-x-6' : 'translate-x-1'}
      `} />
    </button>
  </div>
);

// --- Page Component ---

export default function SettingsPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Form States
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    departmentId: string;
  }>({ name: '', email: '', departmentId: '' });

  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    reminders: true
  });
  
  const [availability, setAvailability] = useState<{
    days: string[];
    startTime: string;
    endTime: string;
  }>({
    days: [],
    startTime: '09:00',
    endTime: '17:00'
  });

  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, deptData] = await Promise.all([
          getDoctorProfile(),
          getJson<{data: {id: string, name: string}[]}>('/api/departments')
        ]);

        setProfile({
          name: profileData.name,
          email: profileData.email,
          departmentId: profileData.departmentId || ''
        });

        setDepartments(deptData.data);

        if (profileData.schedules && profileData.schedules.length > 0) {
            const days = profileData.schedules
                .filter(s => s.isActive)
                .map(s => dayMap[s.dayOfWeek]);
            
            // Assume uniform start/end time for now, take from first entry
            if (days.length > 0) {
                setAvailability({
                    days,
                    startTime: profileData.schedules[0].startTime,
                    endTime: profileData.schedules[0].endTime
                });
            }
        }

      } catch (err) {
        console.error("Failed to load settings data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
        await updateDoctorProfile(profile);
        addToast('success', 'Profile updated successfully');
    } catch (err) {
        console.error(err);
        addToast('error', 'Failed to update profile');
    } finally {
        setSavingProfile(false);
    }
  };

  const handleScheduleSave = async () => {
    setSavingSchedule(true);
    try {
        const daysIndices = availability.days.map(d => dayMap.indexOf(d));
        await updateDoctorSchedule({
            days: daysIndices,
            startTime: availability.startTime,
            endTime: availability.endTime
        });
        addToast('success', 'Schedule updated successfully');
    } catch (err) {
        console.error(err);
        addToast('error', 'Failed to update schedule');
    } finally {
        setSavingSchedule(false);
    }
  };

  if (loading) {
      return (
          <div className="flex-1 flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        
        {/* Section 1: Profile Settings */}
        <SettingSection title="Profile Information" icon={<User className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={profile.departmentId}
                  onChange={(e) => setProfile({...profile, departmentId: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200 disabled:opacity-70"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Profile
            </button>
          </div>
        </SettingSection>

        {/* Section 2: Availability Settings */}
        <SettingSection title="Availability Schedule" icon={<Clock className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                      ${availability.days.includes(day) 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }
                    `}
                  >
                    {day.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start Time</label>
                <input 
                  type="time" 
                  value={availability.startTime}
                  onChange={(e) => setAvailability({...availability, startTime: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End Time</label>
                <input 
                  type="time" 
                  value={availability.endTime}
                  onChange={(e) => setAvailability({...availability, endTime: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
                onClick={handleScheduleSave}
                disabled={savingSchedule}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm disabled:opacity-70"
            >
              {savingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Schedule
            </button>
          </div>
        </SettingSection>

        {/* Section 3: Notification Settings */}
        <SettingSection title="Notifications" icon={<Bell className="w-5 h-5" />}>
          <div className="space-y-4">
            <ToggleSwitch 
              label="Email Notifications" 
              description="Receive updates about your appointments via email."
              checked={notifications.email} 
              onChange={() => setNotifications({...notifications, email: !notifications.email})} 
            />
            <div className="h-px bg-slate-100" />
            <ToggleSwitch 
              label="SMS Notifications" 
              description="Receive urgent alerts via SMS."
              checked={notifications.sms} 
              onChange={() => setNotifications({...notifications, sms: !notifications.sms})} 
            />
            <div className="h-px bg-slate-100" />
            <ToggleSwitch 
              label="Appointment Reminders" 
              description="Get reminded 1 hour before every appointment."
              checked={notifications.reminders} 
              onChange={() => setNotifications({...notifications, reminders: !notifications.reminders})} 
            />
          </div>
        </SettingSection>

        {/* Security Section (Bonus) */}
        <SettingSection title="Security" icon={<Shield className="w-5 h-5" />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Enable</button>
          </div>
        </SettingSection>

      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
