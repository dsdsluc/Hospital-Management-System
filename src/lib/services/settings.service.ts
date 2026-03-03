import fs from "fs/promises";
import path from "path";
import { SystemSettings } from "@/types/settings";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    hospitalName: "MedCore Hospital",
    address: "123 Healthcare Blvd, Medical City, MC 10101",
    contactEmail: "admin@medcore.com",
    contactPhone: "+1 (555) 123-4567",
    website: "https://medcore.com",
  },
  security: {
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChar: true,
  },
  notifications: {
    enableEmailAlerts: true,
    enableSmsAlerts: false,
    systemMaintenanceMode: false,
  },
};

export class SettingsService {
  static async getSettings(): Promise<SystemSettings> {
    try {
      // Ensure directory exists
      try {
        await fs.access(DATA_DIR);
      } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
      }

      // Check if file exists
      try {
        await fs.access(SETTINGS_FILE);
      } catch {
        // If not, create with defaults
        await this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }

      const data = await fs.readFile(SETTINGS_FILE, "utf-8");
      const settings = JSON.parse(data);
      
      // Merge with defaults to ensure all fields exist (in case of updates)
      return {
        general: { ...DEFAULT_SETTINGS.general, ...settings.general },
        security: { ...DEFAULT_SETTINGS.security, ...settings.security },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...settings.notifications },
      };
    } catch (error) {
      console.error("Failed to read settings", error);
      return DEFAULT_SETTINGS;
    }
  }

  static async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSettings();
    
    // Deep merge
    const updated: SystemSettings = {
      general: { ...current.general, ...newSettings.general },
      security: { ...current.security, ...newSettings.security },
      notifications: { ...current.notifications, ...newSettings.notifications },
    };

    await this.saveSettings(updated);
    return updated;
  }

  private static async saveSettings(settings: SystemSettings): Promise<void> {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  }
}
