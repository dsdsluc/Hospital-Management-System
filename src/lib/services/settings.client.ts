import { getJson, patchJson } from "@/lib/services/http";
import { SystemSettings } from "@/types/settings";

export async function getAdminSettings() {
  return getJson<{ data: SystemSettings }>("/api/admin/settings").then(res => res.data);
}

export async function updateAdminSettings(settings: Partial<SystemSettings>) {
  return patchJson<{ success: boolean; data: SystemSettings }>("/api/admin/settings", settings).then(res => res.data);
}
