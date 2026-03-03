"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Role = "DOCTOR" | "PATIENT";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role>("PATIENT");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const payload =
        role === "DOCTOR"
          ? { role, fullName, email, password }
          : { role, fullName, email, password, phone };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Registration failed");
      } else {
        const data = await res.json();
        if (role === "DOCTOR") {
          setSuccess(data.message || "Your doctor account is pending admin approval.");
          // Clear form or redirect after delay?
          // For now, show success message and link to login
        } else {
          router.push("/login");
          router.refresh();
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Registration Successful</h2>
          <p className="text-green-700">{success}</p>
        </div>
        <Link href="/login">
          <Button>Back to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create an account</h1>
        <p className="text-slate-500 mt-2">Choose role and fill required fields.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <div className="flex gap-3">
              {(["DOCTOR", "PATIENT"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={
                    `px-4 py-2 rounded-xl border ${role === r ? "border-blue-600 text-blue-600" : "border-slate-200 text-slate-700"}`
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* Department input removed for DOCTOR */}

          {role === "PATIENT" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          )}
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
