"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  UserPlus, 
  Activity, 
  ArrowUpRight,
  MoreVertical,
  Loader2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { AdminDashboardStats, getAdminDashboardStats } from "@/lib/services/admin-dashboard.client";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
        addToast("error", "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Patients" 
          value={stats.counts.patients} 
          icon={Users} 
          color="blue"
          href="/admin/patients"
        />
        <StatCard 
          title="Total Doctors" 
          value={stats.counts.doctors} 
          icon={Stethoscope} 
          color="emerald"
          href="/admin/doctors"
        />
        <StatCard 
          title="Appointments" 
          value={stats.counts.appointments} 
          icon={Calendar} 
          color="purple"
          href="/admin/appointments"
        />
        <StatCard 
          title="Pending Approvals" 
          value={stats.counts.pendingApprovals} 
          icon={UserPlus} 
          color="amber"
          href="/admin/access?status=PENDING_APPROVAL"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointment Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Appointment Trends</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 font-medium focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.appointmentTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Top Departments</h3>
          <p className="text-xs text-slate-500 mb-6">Distribution of appointments by department</p>
          
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.charts.departmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.charts.departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
               <div className="text-center">
                 <span className="block text-2xl font-bold text-slate-800">
                    {stats.charts.departmentDistribution.reduce((a, b) => a + b.value, 0)}
                 </span>
                 <span className="text-xs text-slate-500 uppercase font-medium">Total</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          <Link href="/admin/reports" className="text-sm text-blue-600 font-medium hover:text-blue-700">
            View All Reports
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentActivity.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No recent activity found.</div>
          ) : (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Activity size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{activity.desc}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(activity.date).toLocaleString()} • <span className="font-medium">{activity.status}</span>
                  </p>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-2">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }: { title: string, value: number, icon: any, color: string, href: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <Link href={href} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} className="mr-1" />
          12%
        </div>
      </div>
      <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
    </Link>
  );
}
