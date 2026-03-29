import { z } from "zod";

import { NotificationEventType } from "../enums/notification.enums";

export const updatePreferenceItemSchema = z.object({
  eventType: z.nativeEnum(NotificationEventType),
  inApp: z.boolean(),
  email: z.boolean()
});

export const updatePreferencesSchema = z.object({
  preferences: z.array(updatePreferenceItemSchema).min(1)
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
