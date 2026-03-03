"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu, ChevronDown, LogOut } from "lucide-react";
import { getDoctorProfile } from "@/lib/services/doctor.client";
import { logout } from "@/lib/auth/logout";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const [doctor, setDoctor] = useState<{
    name: string;
    specialization: string;
  } | null>(null);

  useEffect(() => {
    getDoctorProfile()
      .then((data) => {
        setDoctor({
          name: data.name,
          specialization: data.specialization || "General",
        });
      })
      .catch(console.error);
  }, []);

  const getTitle = () => {
    if (pathname === "/doctor/appointments") return "My Appointments";
    if (pathname === "/doctor/clinical") return "Clinical Data";
    if (pathname === "/doctor/settings") return "System Settings";
    return null; // Default to Search Bar for Dashboard
  };

  const title = getTitle();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30 shrink-0 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title ? (
          <h1 className="text-xl font-bold text-slate-800 hidden md:block">
            {title}
          </h1>
        ) : (
          <div className="hidden md:flex items-center text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 w-64">
            <Search className="w-4 h-4 mr-2" />
            <input
              type="text"
              placeholder="Search patients, records..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-800">
              {doctor ? doctor.name : "Loading..."}
            </p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
              {doctor ? doctor.specialization.toUpperCase() : "DOCTOR"}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium shadow-sm ring-2 ring-white">
            {doctor ? doctor.name.slice(0, 2).toUpperCase() : "DR"}
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
