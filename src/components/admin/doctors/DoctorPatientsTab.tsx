"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable, Pagination } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface DoctorPatientsTabProps {
  doctorId: string;
}

export function DoctorPatientsTab({ doctorId }: DoctorPatientsTabProps) {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    fetchPatients();
  }, [debouncedSearch, filters.status, filters.page, doctorId]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filters.status) params.append("status", filters.status);

      const res = await fetch(
        `/api/admin/doctors/${doctorId}/patients?${params}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPatients(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "contact", header: "Contact" },
    {
      key: "gender",
      header: "Gender",
      render: (value: string) =>
        value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "-",
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "lastAppointmentDate",
      header: "Last Visit",
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : "Never",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patients..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        loading={loading}
        onRowClick={(patient) => router.push(`/admin/patients/${patient.id}`)}
      />

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      )}
    </div>
  );
}
