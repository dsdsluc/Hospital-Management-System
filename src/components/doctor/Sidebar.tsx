"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Pill,
  Settings,
  Plus,
  X,
  Stethoscope,
  LogOut
} from "lucide-react";
import { getDoctorProfile } from '@/lib/services/doctor.client';
import { logout } from '@/lib/auth/logout';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarItem = ({
  icon,
  label,
  href,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${
        active
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }
    `}
  >
    <span
      className={`${
        active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
      }`}
    >
      {icon}
    </span>
    <span>{label}</span>
  </Link>
);

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [doctor, setDoctor] = useState<{ name: string; specialization: string } | null>(null);

  useEffect(() => {
    getDoctorProfile().then(data => {
      setDoctor({
        name: data.name,
        specialization: data.specialization || 'General'
      });
    }).catch(console.error);
  }, []);

  const isActive = (path: string) => {
    if (path === "/doctor" && pathname === "/doctor") return true;
    if (path !== "/doctor" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Plus className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                MedCore
              </span>
            </div>
            <button
              className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Main
            </div>
            <SidebarItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              href="/doctor"
              active={pathname === "/doctor"}
              onClick={onClose}
            />
            <SidebarItem
              icon={<CalendarDays className="w-5 h-5" />}
              label="My Appointments"
              href="/doctor/appointments"
              active={isActive("/doctor/appointments")}
              onClick={onClose}
            />
            <SidebarItem
              icon={<Users className="w-5 h-5" />}
              label="Patients"
              href="/doctor/clinical"
              active={isActive("/doctor/clinical")}
              onClick={onClose}
            />

            <div className="mt-8 px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Clinical
            </div>
            <SidebarItem
              icon={<FileText className="w-5 h-5" />}
              label="Medical Records"
              href="/doctor/clinical"
              active={isActive("/doctor/clinical")}
              onClick={onClose}
            />
            <SidebarItem
              icon={<Pill className="w-5 h-5" />}
              label="Prescriptions"
              href="/doctor/prescriptions"
              active={isActive("/doctor/prescriptions")}
              onClick={onClose}
            />

            <div className="mt-8 px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System
            </div>
            <SidebarItem
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              href="/doctor/settings"
              active={isActive("/doctor/settings")}
              onClick={onClose}
            />
          </div>

          {/* User Profile Snippet (Bottom Sidebar) */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                {doctor ? doctor.name.slice(0, 2).toUpperCase() : 'DR'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {doctor ? doctor.name : 'Loading...'}
                </p>
                <p className="text-xs text-slate-500 truncate">{doctor ? doctor.specialization : 'Doctor'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-100 shadow-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
