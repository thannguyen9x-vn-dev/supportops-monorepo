import { describe, expect, it } from "vitest";

import { NotificationEventType } from "../enums/notification.enums";
import { updatePreferencesSchema } from "../schemas/notification.schema";

describe("updatePreferencesSchema", () => {
  it("validates valid input", () => {
    const input = {
      preferences: [
        {
          eventType: NotificationEventType.REQUEST_ASSIGNED,
          inApp: true,
          email: false
        }
      ]
    };

    expect(updatePreferencesSchema.parse(input)).toEqual(input);
  });

  it("rejects unknown eventType", () => {
    const result = updatePreferencesSchema.safeParse({
      preferences: [
        {
          eventType: "UNKNOWN_EVENT",
          inApp: true,
          email: false
        }
      ]
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty preferences array", () => {
    const result = updatePreferencesSchema.safeParse({
      preferences: []
    });

    expect(result.success).toBe(false);
  });
});
