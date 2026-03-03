"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { DataTable, Pagination } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const { toasts, addToast, removeToast } = useToast();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 20,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    fetchPatients();
  }, [debouncedSearch, filters.status, filters.page]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filters.status) params.append("status", filters.status);

      const res = await fetch(`/api/admin/patients?${params}`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      setPatients(data.data);
      setPagination(data.pagination);
    } catch (error) {
      addToast("error", "Failed to load patients");
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
      key: "primaryDoctor",
      header: "Primary Doctor",
      render: (value: any) => value?.name || "Unassigned",
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
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <PageHeader
        title="Patient Management"
        description="View and manage hospital patients"
      />

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
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
