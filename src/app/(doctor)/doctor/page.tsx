"use client";

import React, { useEffect, useState } from 'react';
import { 
  CalendarDays, 
  Users, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Pill,
  History,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Types ---

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REQUESTED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'RESCHEDULED';

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  department: string;
  status: AppointmentStatus;
  avatar: string;
}

interface DashboardData {
  stats: {
    todayAppointments: number;
    pendingConfirmations: number;
    completedThisWeek: number;
    totalActivePatients: number;
  };
  todaysSchedule: Appointment[];
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

// --- Mock Data ---

const MOCK_APPOINTMENTS: Appointment[] = [];

// --- Components ---

const StatCard = ({ title, value, icon, trend, trendUp }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
        {icon}
      </div>
    </div>
    {trend && (
      <div className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
        <span>{trendUp ? '↑' : '↓'}</span>
        <span>{trend}</span>
        <span className="text-slate-400 font-normal ml-1">vs last week</span>
      </div>
    )}
  </div>
);

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    REQUESTED: 'bg-amber-50 text-amber-700 border-amber-100',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-100',
    CHECKED_IN: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
    RESCHEDULED: 'bg-orange-50 text-orange-700 border-orange-100',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || styles.PENDING}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const ActionButton = ({ icon, label, onClick, primary = false }: { icon: React.ReactNode, label: string, onClick?: () => void, primary?: boolean }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center justify-center gap-2 w-full p-4 rounded-xl transition-all duration-200 border
      ${primary 
        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md' 
        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
      }
    `}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

// --- Main Page Component ---

export default function DoctorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/doctor/dashboard');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, here&apos;s what&apos;s happening today.</p>
        </div>

        {/* SECTION A: Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Today's Appointments" 
            value={data.stats.todayAppointments.toString()} 
            icon={<CalendarDays className="w-5 h-5 text-blue-600" />} 
            // trend="12%" 
            // trendUp={true}
          />
          <StatCard 
            title="Pending Confirmations" 
            value={data.stats.pendingConfirmations.toString()} 
            icon={<Clock className="w-5 h-5 text-amber-500" />} 
            // trend="5%" 
            // trendUp={false}
          />
          <StatCard 
            title="Completed This Week" 
            value={data.stats.completedThisWeek.toString()} 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} 
          />
          <StatCard 
            title="Active Patients" 
            value={data.stats.totalActivePatients.toString()} 
            icon={<Users className="w-5 h-5 text-purple-500" />} 
            // trend="8%" 
            // trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION B: Today's Schedule (Takes up 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Today&apos;s Schedule
              </h2>
              <button 
                onClick={() => router.push('/doctor/appointments')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                View All
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.todaysSchedule.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                          No appointments scheduled for today.
                        </td>
                      </tr>
                    ) : (
                      data.todaysSchedule.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                            {apt.time}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                {apt.avatar}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{apt.patientName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {apt.department}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={apt.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => router.push(`/doctor/appointments/${apt.id}`)}
                              className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION C: Quick Actions Panel (Takes up 1/3) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Quick Actions
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <ActionButton 
                icon={<Stethoscope className="w-5 h-5" />} 
                label="Create Medical Record" 
                primary 
              />
              <ActionButton 
                icon={<Pill className="w-5 h-5" />} 
                label="Add Prescription" 
              />
              <ActionButton 
                icon={<History className="w-5 h-5" />} 
                label="View Patient History" 
              />
              
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase mb-3">System Status</p>
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  System Operational
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
