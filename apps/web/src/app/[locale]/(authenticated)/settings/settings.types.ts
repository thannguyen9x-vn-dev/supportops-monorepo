import type { CountryCode } from "@/shared/constants/countries";

export type LoadState = "loading" | "ready" | "error" | "empty";
export type SubmitState = "idle" | "saving" | "success" | "error";

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  birthday: string;
  phoneCountry: CountryCode;
  phoneNumber: string;
  address: string;
  country: CountryCode;
  email: string;
  organization: string;
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
  | "companyNews"
  | "accountActivity"
  | "meetupsNearYou"
  | "newMessages"
  | "ratingReminders"
  | "itemUpdateNotifications"
  | "itemCommentNotifications"
  | "buyerReviewNotifications";

export type NotificationGroupKey = "alerts" | "email";

export type NotificationPreference = {
  key: NotificationItemKey;
  group: NotificationGroupKey;
  enabled: boolean;
};

export type SettingsData = {
  avatarUrl: string | null;
  profile: ProfileFormValues;
  notifications: NotificationPreference[];
};
