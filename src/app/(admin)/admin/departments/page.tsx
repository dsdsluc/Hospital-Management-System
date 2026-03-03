"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/PageHeader";
import { Pagination } from "@/components/admin/shared/DataTable";
import { useDepartments } from "@/hooks/admin/useDepartments";
import { DepartmentFilters } from "./components/DepartmentFilters";
import { DepartmentTable } from "./components/DepartmentTable";
import { DepartmentModal } from "./components/DepartmentModal";
import { AssignHeadDialog } from "./components/AssignHeadDialog";

export default function DepartmentsPage() {
  const {
    items,
    pagination,
    loading,
    filters,
    setFilters,
    doctors,
    onCreate,
    onUpdate,
    onDelete,
    onAssignHead,
  } = useDepartments();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<
    (typeof items)[number] | null
  >(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState<(typeof items)[number] | null>(
    null,
  );
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description="Configure hospital departments and assign head doctors"
      />

      <div className="bg-white rounded-lg border p-4">
        <DepartmentFilters
          search={filters.search}
          onChange={(v) => setFilters({ ...filters, search: v, page: 1 })}
          onAdd={() => {
            setEditingDepartment(null);
            setModalOpen(true);
          }}
        />
      </div>

      <DepartmentTable
        data={items}
        onEdit={(item) => {
          setEditingDepartment(item);
          setModalOpen(true);
        }}
        onAssign={(item) => {
          setAssigning(item);
          setAssignOpen(true);
        }}
        onDelete={(item) => onDelete(item.id)}
        onView={(item) => router.push(`/admin/departments/${item.id}`)}
      />

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      )}

      <DepartmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
        onSubmit={
          editingDepartment
            ? (p) => onUpdate(editingDepartment.id, p)
            : onCreate
        }
      />

      <AssignHeadDialog
        key={`${assigning?.id ?? "none"}-${assignOpen ? "open" : "closed"}`}
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setAssigning(null);
        }}
        department={assigning}
        doctors={doctors}
        onAssign={(doctorId) => {
          if (assigning) {
            return onAssignHead(assigning.id, doctorId);
          }
        }}
      />
    </div>
  );
}
