import { describe, expect, it } from "vitest";

import {
  createKnowledgeArticleSchema,
  updateKnowledgeArticleSchema,
} from "../schemas/knowledge-base.schema";

describe("knowledge-base schemas", () => {
  it("applies default status for create payload", () => {
    const parsed = createKnowledgeArticleSchema.parse({
      title: "Printer setup",
      body: "Step 1...",
    });

    expect(parsed.status).toBe("DRAFT");
  });

  it("rejects invalid status", () => {
    const result = createKnowledgeArticleSchema.safeParse({
      title: "A",
      body: "B",
      status: "ARCHIVED",
    });

    expect(result.success).toBe(false);
  });

  it("accepts partial update payload", () => {
    const parsed = updateKnowledgeArticleSchema.parse({
      title: "Updated title",
    });

    expect(parsed.title).toBe("Updated title");
  });
});
