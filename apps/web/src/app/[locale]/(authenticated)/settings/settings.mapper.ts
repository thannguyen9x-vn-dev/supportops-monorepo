import type { UpdateProfileRequest, UserPreferences, UserProfile } from "@supportops/types";
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode as PhoneLibCountryCode
} from "libphonenumber-js";

import { COUNTRY_CODES, type CountryCode } from "@/shared/constants/countries";

import type { NotificationPreference, ProfileFormValues } from "./settings.types";

const DEFAULT_COUNTRY = "US" as CountryCode;

function isCountryCode(value: string): value is CountryCode {
  return COUNTRY_CODES.includes(value as CountryCode);
}

function normalizeBirthdayValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const isoDateTimeMatch = /^(\d{4}-\d{2}-\d{2})T/.exec(trimmed);
  if (isoDateTimeMatch) {
    return isoDateTimeMatch[1] ?? "";
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) {
    return "";
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function splitPhone(phone: string | null | undefined, fallbackCountry: CountryCode): Pick<ProfileFormValues, "phoneCountry" | "phoneNumber"> {
  if (!phone?.trim()) {
    return {
      phoneCountry: fallbackCountry,
      phoneNumber: ""
    };
  }

  const parsed = parsePhoneNumberFromString(phone);
  if (parsed) {
    return {
      phoneCountry: (parsed.country && isCountryCode(parsed.country) ? parsed.country : fallbackCountry),
      phoneNumber: parsed.nationalNumber ?? ""
    };
  }

  const match = /^\+(\d{1,4})\s*(.*)$/.exec(phone.trim());
  if (match) {
    const [, callingCode, nationalNumber] = match;
    const matchedCountry = COUNTRY_CODES.find((code) => {
      try {
        return getCountryCallingCode(code as PhoneLibCountryCode) === callingCode;
      } catch {
        return false;
      }
    });

    return {
      phoneCountry: matchedCountry ?? fallbackCountry,
      phoneNumber: nationalNumber ?? ""
    };
  }

  return {
    phoneCountry: fallbackCountry,
    phoneNumber: phone
  };
}

function buildPhoneNumber(country: CountryCode, nationalNumber: string): string {
  const trimmedNumber = nationalNumber.trim();
  if (!trimmedNumber) {
    return "";
  }

  try {
    const callingCode = getCountryCallingCode(country as PhoneLibCountryCode);
    return `+${callingCode} ${trimmedNumber}`;
  } catch {
    return trimmedNumber;
  }
}

export function toProfileFormValues(profile: UserProfile): ProfileFormValues {
  const country = (profile.country || DEFAULT_COUNTRY) as CountryCode;
  const { phoneCountry, phoneNumber } = splitPhone(profile.phone, country);

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    systemRole: profile.role ?? "",
    birthday: normalizeBirthdayValue(profile.birthday),
    phoneCountry,
    phoneNumber,
    address: profile.address ?? "",
    country,
    email: profile.email,
    zipCode: profile.zipCode ?? "",
    city: profile.city ?? "",
    department: profile.department ?? ""
  };
}

type ToUpdateProfileRequestOptions = {
  includeDepartment?: boolean;
};

export function toUpdateProfileRequest(
  values: ProfileFormValues,
  options: ToUpdateProfileRequestOptions = {},
): UpdateProfileRequest {
  const { includeDepartment = true } = options;
  const request: UpdateProfileRequest = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
  };

  const phone = buildPhoneNumber(values.phoneCountry, values.phoneNumber);
  if (phone) {
    request.phone = phone;
  }

  const birthday = normalizeBirthdayValue(values.birthday);
  if (birthday) {
    request.birthday = birthday;
  }

  const city = values.city.trim();
  if (city) {
    request.city = city;
  }

  const department = values.department.trim();
  if (includeDepartment && department) {
    request.department = department;
  }

  return request;
}

export function toNotificationPreferences(preferences: UserPreferences): NotificationPreference[] {
  return [
    { key: "assignmentAlerts", group: "alerts", enabled: preferences.assignmentAlerts },
    { key: "statusUpdateAlerts", group: "alerts", enabled: preferences.statusUpdateAlerts },
    { key: "slaRiskAlerts", group: "alerts", enabled: preferences.slaRiskAlerts },
    { key: "escalationAlerts", group: "alerts", enabled: preferences.escalationAlerts },
    { key: "resolutionReminders", group: "email", enabled: preferences.resolutionReminders },
    { key: "requestUpdateDigest", group: "email", enabled: preferences.requestUpdateDigest },
    { key: "commentNotifications", group: "email", enabled: preferences.commentNotifications },
    { key: "mentionNotifications", group: "email", enabled: preferences.mentionNotifications }
  ];
}

export function toUserPreferences(preferences: NotificationPreference[]): UserPreferences {
  const find = (key: NotificationPreference["key"]) =>
    preferences.find((item) => item.key === key)?.enabled ?? false;

  return {
    assignmentAlerts: find("assignmentAlerts"),
    statusUpdateAlerts: find("statusUpdateAlerts"),
    slaRiskAlerts: find("slaRiskAlerts"),
    escalationAlerts: find("escalationAlerts"),
    resolutionReminders: find("resolutionReminders"),
    requestUpdateDigest: find("requestUpdateDigest"),
    commentNotifications: find("commentNotifications"),
    mentionNotifications: find("mentionNotifications")
  };
}
