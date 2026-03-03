"use client";
import { useState, useTransition } from "react";

type Department = {
  id: string;
  name: string;
  description?: string | null;
};

export default function AdminDepartmentsSection({
  initialItems,
}: {
  initialItems: Department[];
}) {
  const [items, setItems] = useState<Department[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/departments");
    setLoading(false);
    if (res.ok) {
      const data = (await res.json()) as Department[];
      setItems(data);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to load departments");
    }
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      setSuccess(null);
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
        }),
      });
      if (res.ok) {
        const dept = (await res.json()) as Department;
        setItems((prev) => [dept, ...prev]);
        setName("");
        setDescription("");
        setSuccess("Department created");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.issues?.fieldErrors?.name?.[0] ??
            data?.error ??
            "Failed to create department",
        );
      }
    });
  }

  function startEdit(d: Department) {
    setEditingId(d.id);
    setEditName(d.name);
    setEditDescription(d.description ?? "");
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  async function saveEdit() {
    if (!editingId) return;
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/departments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        name: editName,
        description: editDescription || undefined,
      }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Department;
      setItems((prev) =>
        prev.map((it) => (it.id === updated.id ? updated : it)),
      );
      setSuccess("Department updated");
      cancelEdit();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        data?.issues?.fieldErrors?.name?.[0] ??
          data?.error ??
          "Failed to update department",
      );
    }
  }

  async function remove(id: string) {
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/departments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((it) => it.id !== id));
      setSuccess("Department deleted");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to delete department");
    }
  }

  return (
    <section id="departments" className="mt-8">
      <h2 className="text-xl font-semibold mb-3 dark:text-zinc-50">
        Departments
      </h2>
      {(error || success) && (
        <div
          className={`mb-4 rounded border px-3 py-2 ${
            error
              ? "border-red-600 text-red-600"
              : "border-green-600 text-green-600"
          }`}
        >
          {error || success}
        </div>
      )}
      <form
        onSubmit={onCreate}
        className="flex flex-col gap-3 w-full max-w-md mb-6"
      >
        <input
          className="rounded border px-3 py-2 dark:text-zinc-50"
          placeholder="Department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded border px-3 py-2 dark:text-zinc-50"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          disabled={isPending}
          className="rounded-md bg-black text-white px-4 py-2 dark:bg-white dark:text-black"
          type="submit"
        >
          {isPending ? "Creating..." : "Create Department"}
        </button>
      </form>
      <div className="mb-2 flex items-center gap-3 dark:text-zinc-50">
        <span>
          {loading
            ? "Loading..."
            : items.length === 0
              ? "No departments yet"
              : ""}
        </span>
        <button className="rounded-md border px-3 py-1" onClick={load}>
          Refresh
        </button>
      </div>
      <ul className="space-y-3">
        {items.map((d) => (
          <li key={d.id} className="flex items-center gap-3 dark:text-zinc-50">
            {editingId === d.id ? (
              <>
                <input
                  className="rounded border px-2 py-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className="rounded border px-2 py-1"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button
                  className="rounded-md bg-black text-white px-3 py-1 dark:bg-white dark:text-black"
                  onClick={saveEdit}
                >
                  Save
                </button>
                <button
                  className="rounded-md border px-3 py-1"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">
                  {d.name}
                  {d.description ? ` — ${d.description}` : ""}
                </span>
                <button
                  className="rounded-md border px-3 py-1"
                  onClick={() => startEdit(d)}
                >
                  Edit
                </button>
                <button
                  className="rounded-md border px-3 py-1"
                  onClick={() => remove(d.id)}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
