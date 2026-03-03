"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/patient/shared/PageHeader";
import { MedicalRecordCard } from "@/components/patient/medical-records/MedicalRecordCard";
import { SearchBar } from "@/components/patient/shared/SearchBar";
import { FilterDropdown } from "@/components/patient/shared/FilterDropdown";
import { Pagination } from "@/components/patient/shared/Pagination";
import { EmptyState } from "@/components/patient/shared/EmptyState";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchRecords();
  }, [searchQuery, typeFilter, currentPage]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter) params.append("type", typeFilter);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/patient/medical-records?${params}`);

      if (res.status === 404) {
        setRecords([]);
        setPagination(null);
        return; // Silent return, EmptyState will show
      }

      if (!res.ok) throw new Error("Failed to fetch records");

      const data = await res.json();
      setRecords(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      // Only show error toast for non-404 errors to avoid spamming on new profiles
      // addToast("error", "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />
      <PageHeader
        title="Medical Records"
        description="Access and download your medical history and reports."
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search records..."
          onSearch={setSearchQuery}
          className="w-full sm:w-72"
        />
        <div className="flex gap-2">
          <FilterDropdown
            label="Record Type"
            options={[
              { label: "Reports", value: "Report" },
              { label: "Lab Results", value: "Lab Result" },
              { label: "Imaging", value: "Imaging" },
              { label: "Prescriptions", value: "Prescription" },
            ]}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : records.length > 0 ? (
          records.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onView={(id) => console.log("View", id)}
              onDownload={(id) => console.log("Download", id)}
            />
          ))
        ) : (
          <EmptyState
            title="No records found"
            description={
              searchQuery || typeFilter
                ? "Try adjusting your search or filters."
                : "You don't have any medical records yet."
            }
            icon={FileText}
            action={
              searchQuery || typeFilter ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}
    </div>
  );
}
