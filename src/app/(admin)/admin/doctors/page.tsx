"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { DataTable, Pagination } from "@/components/admin/shared/DataTable";
import { DoctorFilters } from "@/components/admin/doctors/DoctorFilters";
import { DoctorModal } from "@/components/admin/doctors/DoctorModal";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { Plus, Edit, Archive, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { DoctorStatusDropdown } from "@/components/admin/doctors/DoctorStatusDropdown";
import { UserStatus } from "@prisma/client";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string | null;
  department: { id: string; name: string } | null;
  status: UserStatus;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    departmentId: "",
    status: "",
    page: 1,
    limit: 20,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filters.departmentId)
        params.append("departmentId", filters.departmentId);
      if (filters.status) params.append("status", filters.status);

      const response = await fetch(`/api/admin/doctors?${params}`);

      if (response.status === 401 || response.status === 403) {
        addToast("error", "Unauthorized access. Redirecting to login...");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch doctors: ${response.statusText}`,
        );
      }

      const data = await response.json();
      setDoctors(data.data);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      addToast("error", error.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [debouncedSearch, filters.departmentId, filters.status, filters.page]);

  const handleCreateDoctor = async (data: any) => {
    try {
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create doctor");
      }

      setModalOpen(false);
      addToast("success", "Doctor created successfully");
      fetchDoctors();
    } catch (error: any) {
      addToast("error", error.message);
    }
  };

  const handleUpdateDoctor = async (data: any) => {
    if (!editingDoctor) return;

    try {
      // Optimistic update
      const updatedDoctors = doctors.map((d) =>
        d.id === editingDoctor.id ? { ...d, ...data } : d,
      );
      setDoctors(updatedDoctors as Doctor[]);

      const response = await fetch(`/api/admin/doctors/${editingDoctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update doctor");
      }

      setModalOpen(false);
      setEditingDoctor(null);
      addToast("success", "Doctor updated successfully");
      fetchDoctors();
    } catch (error: any) {
      addToast("error", error.message);
      fetchDoctors(); // Rollback
    }
  };

  const handleApproveDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setModalOpen(true);
  };

  const handleApproveSubmit = async (data: any) => {
    if (!editingDoctor) return;

    try {
      const response = await fetch(
        `/api/admin/doctors/${editingDoctor.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve doctor");
      }

      setModalOpen(false);
      setEditingDoctor(null);
      addToast("success", "Doctor approved and activated");
      fetchDoctors();
    } catch (error: any) {
      addToast("error", error.message);
    }
  };

  const handleArchiveDoctor = (doctor: Doctor) => {
    setConfirmDialog({
      open: true,
      title: "Archive Doctor",
      message: `Are you sure you want to archive Dr. ${doctor.name}? This action cannot be undone immediately.`,
      type: "danger",
      onConfirm: async () => {
        try {
          // Optimistic update
          setDoctors(doctors.filter((d) => d.id !== doctor.id));

          const response = await fetch(
            `/api/admin/doctors/${doctor.id}/archive`,
            {
              method: "DELETE",
            },
          );

          if (!response.ok) throw new Error("Failed to archive doctor");

          addToast("success", "Doctor archived successfully");
        } catch (error) {
          addToast("error", "Failed to archive doctor");
          fetchDoctors(); // Rollback
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleStatusChange = async (doctor: Doctor, newStatus: UserStatus) => {
    setUpdatingStatusId(doctor.id);
    try {
      const response = await fetch(`/api/admin/doctors/${doctor.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      addToast("success", "Doctor status updated successfully");

      // Update local state
      setDoctors(
        doctors.map((d) =>
          d.id === doctor.id ? { ...d, status: newStatus } : d,
        ),
      );
    } catch (error: any) {
      addToast("error", error.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const columns = [
    { key: "name" as const, header: "Name" },
    { key: "email" as const, header: "Email" },
    {
      key: "specialization" as const,
      header: "Specialization",
      render: (value: any) => value || "-",
    },
    {
      key: "department" as const,
      header: "Department",
      render: (_value: any, item: any) => item.department?.name || "-",
    },
    {
      key: "status" as const,
      header: "Status",
      render: (_value: any, item: any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DoctorStatusDropdown
            currentStatus={item.status}
            onStatusChange={(newStatus) => handleStatusChange(item, newStatus)}
            loading={updatingStatusId === item.id}
          />
        </div>
      ),
    },
    {
      key: "id" as const,
      header: "Actions",
      className: "text-right",
      render: (_value: any, doctor: Doctor) => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {doctor.status === "PENDING_APPROVAL" ? (
            <button
              onClick={() => handleApproveDoctor(doctor)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
              title="Approve"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingDoctor(doctor);
                setModalOpen(true);
              }}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleArchiveDoctor(doctor)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <PageHeader
        title="Doctor Management"
        description="Manage hospital doctors, approvals, and departments"
        actions={
          <button
            onClick={() => {
              setEditingDoctor(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
          </button>
        }
      />

      <DoctorFilters filters={filters} onFiltersChange={setFilters} />

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-lg border">
          <Spinner />
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No doctors found"
          description="Get started by adding a new doctor or adjusting your filters."
          action={
            <button
              onClick={() => {
                setEditingDoctor(null);
                setModalOpen(true);
              }}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Add Doctor
            </button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={doctors}
          loading={loading}
          onRowClick={(doctor) => {
            if (doctor.status === "PENDING_APPROVAL") {
              handleApproveDoctor(doctor);
            } else {
              setEditingDoctor(doctor);
              setModalOpen(true);
            }
          }}
        />
      )}

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      )}

      <DoctorModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDoctor(null);
        }}
        doctor={editingDoctor}
        onSubmit={
          editingDoctor?.status === "PENDING_APPROVAL"
            ? handleApproveSubmit
            : editingDoctor
              ? handleUpdateDoctor
              : handleCreateDoctor
        }
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmButtonClassName={
          confirmDialog.type === "danger"
            ? "bg-red-600 hover:bg-red-700"
            : confirmDialog.type === "warning"
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
        }
      />
    </div>
  );
}
