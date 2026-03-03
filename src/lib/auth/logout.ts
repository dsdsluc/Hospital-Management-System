"use client";

export async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed", error);
    // Force redirect even if API fails
    window.location.href = "/login";
  }
}
