import type { CountryCode } from "@/shared/constants/countries";

export type LoadState = "loading" | "ready" | "error" | "empty";
export type SubmitState = "idle" | "saving" | "success" | "error";

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  systemRole: string;
  birthday: string;
  phoneCountry: CountryCode;
  phoneNumber: string;
  address: string;
  country: CountryCode;
  email: string;
  zipCode: string;
  city: string;
  department: string;
};

export type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type NotificationItemKey =
  | "assignmentAlerts"
  | "statusUpdateAlerts"
  | "slaRiskAlerts"
  | "escalationAlerts"
  | "resolutionReminders"
  | "requestUpdateDigest"
  | "commentNotifications"
  | "mentionNotifications";

export type NotificationGroupKey = "alerts" | "email";

export type NotificationPreference = {
  key: NotificationItemKey;
  group: NotificationGroupKey;
  enabled: boolean;
};

export type SettingsData = {
  avatarUrl: string | null;
  joinedAt: string | null;
  profile: ProfileFormValues;
  notifications: NotificationPreference[];
};
