import type { UserRole } from "../enums";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  address: string | null;
  city: string | null;
  zipCode: string | null;
  country: string | null;
  organization: string | null;
  department: string | null;
  timezone: string;
  locale: string;
  role: string;
  joinedAt: string | null;
}

export interface UserPreferences {
  assignmentAlerts: boolean;
  statusUpdateAlerts: boolean;
  slaRiskAlerts: boolean;
  escalationAlerts: boolean;
  resolutionReminders: boolean;
  requestUpdateDigest: boolean;
  commentNotifications: boolean;
  mentionNotifications: boolean;
}

export interface UserSession {
  id: string;
  browser: string;
  device: string;
  location: string;
  lastAccessed: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  joinedAt: string | null;
}
