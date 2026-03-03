'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DoctorFiltersProps {
  filters: {
    search: string;
    departmentId: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

interface Department {
  id: string;
  name: string;
}

export function DoctorFilters({ filters, onFiltersChange }: DoctorFiltersProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments?limit=100');
      if (response.ok) {
        const json = await response.json();
        const list = json.data ?? json;
        setDepartments(list.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, email, or specialization..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.departmentId}
            onChange={(e) => handleFilterChange('departmentId', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
          </select>
        </div>
      </div>
    </div>
  );
}
