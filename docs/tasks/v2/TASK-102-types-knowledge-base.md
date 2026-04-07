# TASK-102 — Types: Knowledge Base
> **Phase:** 1 — Types | **Prereq:** TASK-101 done

---

## Files cần tạo / sửa

```text
packages/types/src/
├── types/
│   └── knowledge-base.types.ts    ← TẠO MỚI
├── schemas/
│   └── knowledge-base.schema.ts   ← TẠO MỚI
└── index.ts                        ← SỬA: append exports
```

---

## Spec chi tiết

### `types/knowledge-base.types.ts`
```typescript
export type KnowledgeBaseStatus = 'DRAFT' | 'PUBLISHED';

export interface KnowledgeArticle {
  id:         string;
  title:      string;
  body:       string;
  category:   string | null;
  tags:       string[];
  status:     KnowledgeBaseStatus;
  authorId:   string;
  authorName: string;
  createdAt:  string;
  updatedAt:  string;
}

export interface KnowledgeArticleSummary {
  id:         string;
  title:      string;
  category:   string | null;
  tags:       string[];
  status:     KnowledgeBaseStatus;
  authorName: string;
  updatedAt:  string;
}

export interface KnowledgeArticlePickerItem {
  id:    string;
  title: string;
  slug:  string;
}
```

### `schemas/knowledge-base.schema.ts`
```typescript
import { z } from 'zod';

export const createKnowledgeArticleSchema = z.object({
  title:    z.string().min(1).max(200),
  body:     z.string().min(1).max(50000),
  category: z.string().max(100).optional(),
  tags:     z.array(z.string()).max(10).optional(),
  status:   z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export const updateKnowledgeArticleSchema = createKnowledgeArticleSchema.partial();

export type CreateKnowledgeArticleInput = z.infer<typeof createKnowledgeArticleSchema>;
export type UpdateKnowledgeArticleInput = z.infer<typeof updateKnowledgeArticleSchema>;
```

---

## Quality gate
```bash
cd packages/types && pnpm typecheck
pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-103**
