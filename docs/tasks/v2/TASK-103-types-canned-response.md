# TASK-103 — Types: Canned Response
> **Phase:** 1 — Types | **Prereq:** TASK-102 done

---

## Files cần tạo / sửa

```text
packages/types/src/
├── types/
│   └── canned-response.types.ts    ← TẠO MỚI
├── schemas/
│   └── canned-response.schema.ts   ← TẠO MỚI
└── index.ts                         ← SỬA: append exports
```

---

## Spec chi tiết

### `types/canned-response.types.ts`
```typescript
export interface CannedResponse {
  id:        string;
  title:     string;
  body:      string;
  category:  string | null;
  tags:      string[];
  shortcut:  string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CannedResponsePickerItem {
  id:       string;
  title:    string;
  shortcut: string | null;
  body:     string;
}
```

### `schemas/canned-response.schema.ts`
```typescript
import { z } from 'zod';

export const createCannedResponseSchema = z.object({
  title:    z.string().min(1).max(100),
  body:     z.string().min(1).max(5000),
  category: z.string().max(100).optional(),
  tags:     z.array(z.string()).max(10).optional(),
  shortcut: z.string().max(30).regex(/^[a-z0-9_-]+$/).optional(),
});

export const updateCannedResponseSchema = createCannedResponseSchema.partial();

export type CreateCannedResponseInput = z.infer<typeof createCannedResponseSchema>;
export type UpdateCannedResponseInput = z.infer<typeof updateCannedResponseSchema>;
```

---

## Quality gate
```bash
cd packages/types && pnpm typecheck
pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-104**
