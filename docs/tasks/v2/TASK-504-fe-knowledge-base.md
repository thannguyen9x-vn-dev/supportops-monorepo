# TASK-504 — FE: Knowledge Base Pages + KB Picker
> **Phase:** 5 — Frontend
> **Prereq:** TASK-305 done (API)

---

## Files cần tạo / sửa

```text
apps/web/src/app/[locale]/(authenticated)/knowledge-base/
├── page.tsx                    ← TẠO MỚI (≤ 50 lines)
├── loading.tsx                 ← TẠO MỚI
├── new/
│   └── page.tsx                ← TẠO MỚI (≤ 50 lines)
└── [id]/
    ├── page.tsx                ← TẠO MỚI (≤ 50 lines)
    └── edit/
        └── page.tsx            ← TẠO MỚI (≤ 50 lines)

apps/web/src/features/knowledge-base/
├── components/
│   ├── KnowledgeBaseView.tsx           ← TẠO MỚI (≤ 150 lines)
│   ├── KnowledgeBaseHeader.tsx         ← TẠO MỚI (≤ 50 lines)
│   ├── KnowledgeBaseTable.tsx          ← TẠO MỚI (≤ 100 lines)
│   ├── KnowledgeArticleDetailView.tsx  ← TẠO MỚI (≤ 150 lines)
│   ├── KnowledgeArticleForm.tsx        ← TẠO MỚI (≤ 150 lines)
│   └── KnowledgeBasePickerModal.tsx    ← TẠO MỚI (≤ 100 lines)
├── hooks/
│   ├── useKnowledgeBase.ts             ← TẠO MỚI (≤ 120 lines)
│   └── useKnowledgeBasePicker.ts       ← TẠO MỚI (≤ 60 lines)
└── services/
    └── knowledge-base.service.ts       ← TẠO MỚI (≤ 80 lines)

apps/web/src/features/service-ops/requests/components/activity/comments/
└── CommentComposer.tsx                 ← SỬA: thêm KB picker button
```

---

## Spec chi tiết

### `knowledge-base.service.ts`
```typescript
export const knowledgeBaseService = {
  list:      (q: KnowledgeArticleQuery) =>
    apiClient.get<PaginatedResponse<KnowledgeArticleSummary>>(KNOWLEDGE_BASE_ENDPOINTS.list, { params: q }),
  search:    (q: string) =>
    apiClient.get<KnowledgeArticlePickerItem[]>(KNOWLEDGE_BASE_ENDPOINTS.search, { params: { q } }),
  detail:    (id: string) =>
    apiClient.get<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.detail(id)),
  create:    (data: CreateKnowledgeArticleInput) =>
    apiClient.post<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.create, data),
  update:    (id: string, data: UpdateKnowledgeArticleInput) =>
    apiClient.put<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.update(id), data),
  publish:   (id: string) =>
    apiClient.patch(KNOWLEDGE_BASE_ENDPOINTS.publish(id)),
  unpublish: (id: string) =>
    apiClient.patch(KNOWLEDGE_BASE_ENDPOINTS.unpublish(id)),
  delete:    (id: string) =>
    apiClient.delete(KNOWLEDGE_BASE_ENDPOINTS.delete(id)),
};
```

### `useKnowledgeBasePicker.ts`
```typescript
export function useKnowledgeBasePicker() {
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['kb-picker', query],
    queryFn:  () => knowledgeBaseService.search(query),
    enabled:  query.length >= 2,
    staleTime: 30_000,
  });

  return { results: data ?? [], isLoading, query, setQuery };
}
```

### `KnowledgeBasePickerModal.tsx`
```text
UI flow:
1. User click KB icon trong CommentComposer
2. Modal mở: search input + results list
3. User type → debounce 300ms → call search API
4. User click article → modal đóng → chèn "[title](url)" vào composer
```

### `KnowledgeArticleForm.tsx` — fields
```text
- title: TextField (required, max 200)
- category: TextField (optional)
- tags: Chip input (optional, max 10)
- body: Markdown editor HOẶC TextField multiline
  → Kiểm tra packages/ui đã có MarkdownEditor chưa
  → Nếu chưa → dùng TextField multiline, ghi TODO
- status: Select [DRAFT | PUBLISHED]
- Submit: "Save as Draft" | "Publish"
```

### RBAC guards trong FE
```typescript
// "Create" button chỉ hiện với TECHNICIAN+
// "Edit"/"Delete" button:
//   TECHNICIAN: chỉ hiện với article.authorId === currentUser.id
//   OPS_COORDINATOR+: hiện tất cả
// Dùng usePermission() hook (đã có trong apps/web)
```

### Sửa `CommentComposer.tsx`
```typescript
// Thêm IconButton KB bên cạnh các toolbar buttons hiện có
// Khi click → setKBPickerOpen(true)
// Khi picker chọn article:
//   const link = `[${article.title}](${window.location.origin}/knowledge-base/${article.id})`;
//   insertTextAtCursor(link);
//   setKBPickerOpen(false);
```

---

## i18n keys
```json
"knowledgeBase": {
  "title": "Knowledge Base",
  "new": "New Article",
  "search": "Search articles...",
  "status": {
    "DRAFT": "Draft",
    "PUBLISHED": "Published"
  },
  "picker": {
    "title": "Insert Knowledge Base Article",
    "placeholder": "Search by title or keyword...",
    "empty": "No articles found"
  },
  "form": {
    "title": "Title",
    "body": "Content",
    "category": "Category",
    "tags": "Tags",
    "saveDraft": "Save as Draft",
    "publish": "Publish"
  }
}
```

---

## Test cases bắt buộc
```text
✓ EMPLOYEE: không thấy "New Article" button
✓ EMPLOYEE: không thể navigate đến /knowledge-base/new (redirect)
✓ TECHNICIAN: thấy Edit/Delete chỉ với bài của mình
✓ useKnowledgeBasePicker: không call API khi query < 2 ký tự
✓ KnowledgeBasePickerModal: chèn đúng markdown link vào composer
✓ KnowledgeBaseTable: hiển thị status chip đúng
```

## Quality gate
```bash
pnpm --filter @supportops/web test KnowledgeBase
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-505**
