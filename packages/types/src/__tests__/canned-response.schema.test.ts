import { describe, expect, it } from "vitest";

import {
  createCannedResponseSchema,
  updateCannedResponseSchema,
} from "../schemas/canned-response.schema";

describe("canned-response schemas", () => {
  it("validates a correct canned response payload", () => {
    const parsed = createCannedResponseSchema.parse({
      title: "Greeting",
      body: "Hello {{requester_name}}",
      shortcut: "greet",
      tags: ["default"],
    });

    expect(parsed.shortcut).toBe("greet");
  });

  it("rejects shortcut with unsupported characters", () => {
    const result = createCannedResponseSchema.safeParse({
      title: "Bad",
      body: "text",
      shortcut: "not valid",
    });

    expect(result.success).toBe(false);
  });

  it("accepts partial update payload", () => {
    const parsed = updateCannedResponseSchema.parse({
      body: "Updated response",
    });

    expect(parsed.body).toBe("Updated response");
  });
});
