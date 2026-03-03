"use client";
import { useState, useEffect } from "react";

type PendingUser = {
  id: string;
  email: string;
  role: string;
  name: string;
  details: {
    specialization?: string;
    licenseNo?: string;
  } | null;
  createdAt: string;
};

export default function AdminPendingUsers() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pending-users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        // If 403 or other error, handle gracefully
        if (res.status === 403) {
            setError("Unauthorized access");
        } else {
            setError("Failed to fetch pending users");
        }
      }
    } catch (err) {
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function approveUser(id: string) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/approve`, {
        method: "PATCH",
      });
      if (res.ok) {
        setSuccess("User approved successfully");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        setError("Failed to approve user");
      }
    } catch (err) {
      setError("An error occurred while approving user");
    }
  }

  if (loading && users.length === 0) return <p className="text-gray-500 dark:text-gray-400">Loading pending users...</p>;

  return (
    <section className="mt-8 mb-8">
      <h2 className="text-xl font-semibold mb-4 dark:text-zinc-50">
        Pending Approvals
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
          {success}
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No pending users.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-zinc-100">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {user.details ? (
                      <div className="flex flex-col gap-1">
                        {user.details.specialization && <span>Spec: {user.details.specialization}</span>}
                        {user.details.licenseNo && <span>Lic: {user.details.licenseNo}</span>}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-semibold border border-green-600 dark:border-green-400 rounded px-3 py-1"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
