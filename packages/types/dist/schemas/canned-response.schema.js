import { z } from "zod";
export const createCannedResponseSchema = z.object({
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(5000),
    category: z.string().max(100).optional(),
    tags: z.array(z.string()).max(10).optional(),
    shortcut: z.string().max(30).regex(/^[a-z0-9_-]+$/).optional()
});
export const updateCannedResponseSchema = createCannedResponseSchema.partial();
