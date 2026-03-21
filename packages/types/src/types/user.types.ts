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
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthday?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  organization?: string;
  department?: string;
  timezone?: string;
  locale?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPreferences {
  companyNews: boolean;
  accountActivity: boolean;
  meetupsNearYou: boolean;
  newMessages: boolean;
  ratingReminders: boolean;
  itemUpdateNotif: boolean;
  itemCommentNotif: boolean;
  buyerReviewNotif: boolean;
}

export interface UserSession {
  id: string;
  browser: string;
  device: string;
  location: string;
  lastAccessed: string;
}
