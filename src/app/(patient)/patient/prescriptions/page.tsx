"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/patient/shared/PageHeader";
import { PrescriptionCard } from "@/components/patient/prescriptions/PrescriptionCard";
import { SearchBar } from "@/components/patient/shared/SearchBar";
import { FilterDropdown } from "@/components/patient/shared/FilterDropdown";
import { Pagination } from "@/components/patient/shared/Pagination";
import { EmptyState } from "@/components/patient/shared/EmptyState";
import { ConfirmDialog } from "@/components/patient/shared/ConfirmDialog";
import { Pill, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [refillId, setRefillId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchPrescriptions();
  }, [searchQuery, statusFilter, currentPage]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/patient/prescriptions?${params}`);

      if (res.status === 404) {
        setPrescriptions([]);
        setPagination(null);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch prescriptions");

      const data = await res.json();
      setPrescriptions(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      // addToast("error", "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleRefill = () => {
    console.log("Refill requested for:", refillId);
    // Here you would typically call an API to request a refill
    addToast("success", "Refill request sent to your doctor");
    setRefillId(null);
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />
      <PageHeader
        title="My Prescriptions"
        description="View your current medications and request refills."
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search medications..."
          onSearch={setSearchQuery}
          className="w-full sm:w-72"
        />
        <FilterDropdown
          label="Status"
          options={[
            { label: "Active", value: "active" },
            { label: "Expired", value: "expired" },
            { label: "Refill Requested", value: "refill_requested" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        ) : prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onRefill={setRefillId}
              onDownload={(id) => console.log("Download", id)}
            />
          ))
        ) : (
          <EmptyState
            title="No prescriptions found"
            description={
              searchQuery || statusFilter
                ? "Try adjusting your search or filters."
                : "You don't have any prescriptions yet."
            }
            icon={Pill}
            action={
              searchQuery || statusFilter ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("");
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

      {/* Refill Dialog */}
      <ConfirmDialog
        isOpen={!!refillId}
        onClose={() => setRefillId(null)}
        onConfirm={handleRefill}
        title="Request Refill"
        description="Would you like to request a refill for this medication? Your doctor will be notified."
        confirmText="Request Refill"
        variant="info"
      />
    </div>
  );
}
