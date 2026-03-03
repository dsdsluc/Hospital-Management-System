'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface AppointmentFiltersProps {
  filters: {
    search: string;
    departmentId: string;
    status: string;
    doctorId: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function AppointmentFilters({ filters, onFiltersChange }: AppointmentFiltersProps) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  
  // Debounce the doctor search separately if needed, but here we load all for dropdown
  // or we could implement async select. For now, simple dropdowns.

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments?limit=100');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.data || data);
      }
    } catch {}
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/admin/doctors?limit=100');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.data || data);
      }
    } catch {}
  };

  const handleChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="End Date"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filters.departmentId}
          onChange={(e) => handleChange('departmentId', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={filters.doctorId}
          onChange={(e) => handleChange('doctorId', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Doctors</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="REQUESTED">Requested</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
          <option value="RESCHEDULED">Rescheduled</option>
        </select>
      </div>
    </div>
  );
}
