import type { UpdateProfileRequest, UserPreferences, UserProfile } from "@supportops/contracts";
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

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return value;
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
    birthday: normalizeBirthdayValue(profile.birthday),
    phoneCountry,
    phoneNumber,
    address: profile.address ?? "",
    country,
    email: profile.email,
    organization: profile.organization ?? "",
    zipCode: profile.zipCode ?? "",
    city: profile.city ?? "",
    department: profile.department ?? ""
  };
}

export function toUpdateProfileRequest(values: ProfileFormValues): UpdateProfileRequest {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    birthday: values.birthday,
    phone: buildPhoneNumber(values.phoneCountry, values.phoneNumber),
    address: values.address,
    country: values.country,
    organization: values.organization,
    zipCode: values.zipCode,
    city: values.city,
    department: values.department
  };
}

export function toNotificationPreferences(preferences: UserPreferences): NotificationPreference[] {
  return [
    { key: "companyNews", group: "alerts", enabled: preferences.companyNews },
    { key: "accountActivity", group: "alerts", enabled: preferences.accountActivity },
    { key: "meetupsNearYou", group: "alerts", enabled: preferences.meetupsNearYou },
    { key: "newMessages", group: "alerts", enabled: preferences.newMessages },
    { key: "ratingReminders", group: "email", enabled: preferences.ratingReminders },
    { key: "itemUpdateNotifications", group: "email", enabled: preferences.itemUpdateNotif },
    { key: "itemCommentNotifications", group: "email", enabled: preferences.itemCommentNotif },
    { key: "buyerReviewNotifications", group: "email", enabled: preferences.buyerReviewNotif }
  ];
}

export function toUserPreferences(preferences: NotificationPreference[]): UserPreferences {
  const find = (key: NotificationPreference["key"]) =>
    preferences.find((item) => item.key === key)?.enabled ?? false;

  return {
    companyNews: find("companyNews"),
    accountActivity: find("accountActivity"),
    meetupsNearYou: find("meetupsNearYou"),
    newMessages: find("newMessages"),
    ratingReminders: find("ratingReminders"),
    itemUpdateNotif: find("itemUpdateNotifications"),
    itemCommentNotif: find("itemCommentNotifications"),
    buyerReviewNotif: find("buyerReviewNotifications")
  };
}
