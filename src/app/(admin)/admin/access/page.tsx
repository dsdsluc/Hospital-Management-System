"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import { DataTable, Pagination } from "@/components/admin/shared/DataTable";
import {
  UserAccess,
  getUsers,
  updateUserAccess,
  Role,
  UserStatus,
} from "@/lib/services/access.client";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";

export default function AccessControlPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");

  // Action State
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, statusFilter, meta.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers({
        page: meta.page,
        limit: meta.limit,
        search: debouncedSearch,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(result.data);
      setMeta(result.meta);
    } catch (error) {
      addToast("error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    user: UserAccess,
    newStatus: UserStatus,
  ) => {
    if (
      confirm(
        `Are you sure you want to change ${user.name}'s status to ${newStatus}?`,
      )
    ) {
      setActionLoading(user.id);
      try {
        await updateUserAccess(user.id, { status: newStatus });
        addToast("success", `User status updated to ${newStatus}`);
        fetchUsers();
      } catch (error) {
        addToast("error", "Failed to update status");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const columns = [
    {
      key: "name" as keyof UserAccess,
      header: "User",
      render: (_: any, user: UserAccess) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              user.role === "ADMIN"
                ? "bg-purple-100 text-purple-600"
                : user.role === "DOCTOR"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role" as keyof UserAccess,
      header: "Role",
      render: (value: any) => {
        const role = value as Role;
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              role === "ADMIN"
                ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                : role === "DOCTOR"
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      key: "status" as keyof UserAccess,
      header: "Status",
      render: (value: any) => {
        const status = value as UserStatus;
        const styles = {
          ACTIVE: "bg-green-50 text-green-700 ring-green-600/20",
          SUSPENDED: "bg-red-50 text-red-700 ring-red-600/20",
          DEACTIVATED: "bg-gray-50 text-gray-700 ring-gray-600/20",
          PENDING_APPROVAL: "bg-amber-50 text-amber-700 ring-amber-600/20",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ${styles[status]}`}
          >
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "lastLoginAt" as keyof UserAccess,
      header: "Last Login",
      render: (date: string) => (
        <span className="text-slate-500 text-sm">
          {date ? new Date(date).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      key: "id" as keyof UserAccess,
      header: "Actions",
      className: "text-right",
      render: (_: any, user: UserAccess) => (
        <div className="flex justify-end gap-2">
          {user.status === "ACTIVE" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(user, "SUSPENDED");
              }}
              disabled={actionLoading === user.id}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Suspend User"
            >
              {actionLoading === user.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(user, "ACTIVE");
              }}
              disabled={actionLoading === user.id}
              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Activate User"
            >
              {actionLoading === user.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Unlock size={16} />
              )}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Access Control
          </h1>
          <p className="text-slate-500 mt-1">
            Manage user roles, permissions, and account status.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PATIENT">Patient</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DEACTIVATED">Deactivated</option>
            <option value="PENDING_APPROVAL">Pending</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          className="border-0 shadow-none rounded-none"
        />
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={(page) => setMeta({ ...meta, page })}
          className="border-t border-slate-100"
        />
      </div>
    </div>
  );
}
