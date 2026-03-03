export interface SystemSettings {
  general: {
    hospitalName: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    website: string;
  };
  security: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireSpecialChar: boolean;
  };
  notifications: {
    enableEmailAlerts: boolean;
    enableSmsAlerts: boolean;
    systemMaintenanceMode: boolean;
  };
}
