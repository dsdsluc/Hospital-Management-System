import { NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/permissions/admin.permission";
import { SettingsService } from "@/lib/services/settings.service";

export async function GET(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("Failed to fetch settings", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: AuthenticatedRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const updated = await SettingsService.updateSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update settings", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
