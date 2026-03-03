"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  TestTube,
  User,
  LogOut,
  Activity,
  X,
} from "lucide-react";
import { getPatientProfile } from "@/lib/services/patient.client";
import { logout } from "@/lib/auth/logout";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "My Appointments", href: "/patient/appointments", icon: Calendar },
  {
    label: "Medical Records",
    href: "/patient/medical-records",
    icon: FileText,
  },
  { label: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
  { label: "Test Results", href: "/patient/test-results", icon: TestTube },
  { label: "Profile Settings", href: "/patient/profile", icon: User },
];

export default function PatientSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState({ name: "User", id: "..." });

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getPatientProfile();
        if (data.role === "PATIENT") {
          setUser({
            name: data.profile.name,
            id: `#${data.user.createdAt.slice(0, 4)}`, // Use creation year/ID snippet as dummy ID
          });
        }
      } catch (error) {
        console.error("Failed to fetch sidebar user", error);
      }
    }
    fetchUser();
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 transform bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-xl md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-50 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight tracking-tight">
                  Patient<span className="text-blue-600">Portal</span>
                </h1>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Healthcare System
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
            <div className="mb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Main Menu
            </div>
            <ul className="space-y-1.5">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                      }`}
                    >
                      <item.icon
                        size={20}
                        className={`transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 m-4 mt-auto rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Patient ID: {user.id}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-red-600 hover:border-red-100 shadow-sm"
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
