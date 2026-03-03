"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateDepartmentForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      setDescription("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to create department");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full max-w-md">
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
      {error && <p className="text-red-600">{error}</p>}
      <button
        disabled={loading}
        className="rounded-md bg-black text-white px-4 py-2 dark:bg-white dark:text-black"
        type="submit"
      >
        {loading ? "Creating..." : "Create Department"}
      </button>
    </form>
  );
}
