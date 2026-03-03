"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/patient/shared/PageHeader";
import { TestResultCard } from "@/components/patient/test-results/TestResultCard";
import { SearchBar } from "@/components/patient/shared/SearchBar";
import { FilterDropdown } from "@/components/patient/shared/FilterDropdown";
import { Pagination } from "@/components/patient/shared/Pagination";
import { EmptyState } from "@/components/patient/shared/EmptyState";
import { Beaker, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";

export default function TestResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [searchQuery, statusFilter, currentPage]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const res = await fetch(`/api/patient/test-results?${params}`);

      if (res.status === 404) {
        setResults([]);
        setPagination(null);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch test results");

      const data = await res.json();
      setResults(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      // addToast("error", "Failed to load test results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />
      <PageHeader
        title="Test Results"
        description="View your laboratory and diagnostic test results."
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search tests..."
          onSearch={setSearchQuery}
          className="w-full sm:w-72"
        />
        <FilterDropdown
          label="Result Status"
          options={[
            { label: "Normal", value: "normal" },
            { label: "Abnormal", value: "abnormal" },
            { label: "Pending", value: "pending" },
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
        ) : results.length > 0 ? (
          results.map((result) => (
            <TestResultCard
              key={result.id}
              result={result}
              onView={(id) => console.log("View", id)}
              onDownload={(id) => console.log("Download", id)}
            />
          ))
        ) : (
          <EmptyState
            title="No results found"
            description={
              searchQuery || statusFilter
                ? "Try adjusting your search or filters."
                : "You don't have any test results yet."
            }
            icon={Beaker}
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
    </div>
  );
}
