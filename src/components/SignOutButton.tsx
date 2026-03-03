"use client";
import { logout } from "@/lib/auth/logout";

export default function SignOutButton() {
  return (
    <button
      className="rounded-md border px-3 py-2 dark:text-zinc-50"
      onClick={logout}
    >
      Sign Out
    </button>
  );
}
