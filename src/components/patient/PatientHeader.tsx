"use client";

import React, { useEffect, useState } from "react";
import { Bell, Search, ChevronDown, Menu, Loader2 } from "lucide-react";
import { getPatientProfile } from "@/lib/services/patient.client";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function PatientHeader({ onMenuClick }: HeaderProps) {
  const [patientName, setPatientName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getPatientProfile();
        if (data.role === "PATIENT") {
          setPatientName(data.profile.name);
        }
      } catch (error) {
        console.error("Failed to fetch profile in header", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-6 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="mr-2 rounded-xl p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block">
          {loading ? (
            <div className="h-6 w-32 animate-pulse rounded bg-gray-100"></div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                Welcome back, <span className="text-blue-600">{patientName}</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">Here is your health overview for today.</p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search (Hidden on small mobile) */}
        <div className="hidden md:flex items-center rounded-xl bg-gray-50 px-4 py-2.5 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-xl border border-gray-100 bg-white p-2.5 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile Dropdown Trigger */}
        <div className="flex items-center gap-3 pl-2 md:border-l md:border-gray-100">
          <button className="flex items-center gap-2 rounded-xl bg-gray-50 p-1.5 pr-3 transition-all hover:bg-gray-100 border border-transparent hover:border-gray-200">
            <div className="h-8 w-8 overflow-hidden rounded-lg bg-blue-100">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patientName || "User"}`} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden text-left md:block">
              {loading ? (
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
              ) : (
                <p className="text-sm font-semibold text-gray-700 leading-none">{patientName}</p>
              )}
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden md:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
