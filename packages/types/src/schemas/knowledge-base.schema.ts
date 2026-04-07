import { z } from "zod";

export const createKnowledgeArticleSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(50000),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT")
});

export const updateKnowledgeArticleSchema = createKnowledgeArticleSchema.partial();

export type CreateKnowledgeArticleInput = z.infer<typeof createKnowledgeArticleSchema>;
export type UpdateKnowledgeArticleInput = z.infer<typeof updateKnowledgeArticleSchema>;
