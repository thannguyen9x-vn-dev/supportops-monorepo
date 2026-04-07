# TASK-505 — FE: Canned Response Management + Picker
> **Phase:** 5 — Frontend
> **Prereq:** TASK-306 done (API)

---

## Files cần tạo / sửa

```text
apps/web/src/app/[locale]/(authenticated)/settings/canned-responses/
├── page.tsx        ← TẠO MỚI (≤ 50 lines)
└── loading.tsx     ← TẠO MỚI

apps/web/src/features/canned-response/
├── components/
│   ├── CannedResponseView.tsx        ← TẠO MỚI (≤ 150 lines)
│   ├── CannedResponseForm.tsx        ← TẠO MỚI (≤ 150 lines)
│   └── CannedResponsePicker.tsx      ← TẠO MỚI (≤ 100 lines)
├── hooks/
│   ├── useCannedResponses.ts         ← TẠO MỚI (≤ 120 lines)
│   └── useCannedResponsePicker.ts    ← TẠO MỚI (≤ 80 lines)
└── services/
    └── canned-response.service.ts    ← TẠO MỚI (≤ 80 lines)

apps/web/src/features/service-ops/requests/components/activity/comments/
└── CommentComposer.tsx               ← SỬA: thêm "/" shortcut trigger
```

---

## Spec chi tiết

### `useCannedResponsePicker.ts`
```typescript
export function useCannedResponsePicker() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['canned-response-picker', query],
    queryFn:  () => cannedResponseService.search(query),
    enabled:  isOpen && query.length >= 1,
    staleTime: 60_000,
  });

  return { results: data ?? [], isOpen, setIsOpen, query, setQuery };
}
```

### `CannedResponsePicker.tsx`
```text
UI flow:
1. User gõ "/" ở đầu dòng trong CommentComposer
2. Dropdown hiện ngay bên dưới cursor
3. User tiếp tục gõ → filter theo shortcut/title
4. Keyboard navigation: ↑↓ để chọn, Enter để chèn, Esc để đóng
5. Khi chọn → replace toàn bộ text trong composer với body đã resolved variables
```

### CommentComposer — detect "/" trigger
```typescript
// Trong onChange handler của textarea/input:
const handleChange = (value: string) => {
  setValue(value);

  // Detect "/" ở đầu dòng hoặc sau newline
  const lines  = value.split('\n');
  const lastLine = lines[lines.length - 1];
  if (lastLine.startsWith('/')) {
    const shortcutQuery = lastLine.slice(1);  // bỏ "/"
    pickerProps.setQuery(shortcutQuery);
    pickerProps.setIsOpen(true);
  } else {
    pickerProps.setIsOpen(false);
  }
};

// Khi user chọn canned response:
const handlePickerSelect = (item: CannedResponsePickerItem) => {
  const resolved = resolveVariables(item.body, {
    requesterName: request.requesterName,
    requestCode:   request.code,
    assigneeName:  currentUser.displayName,
  });
  setValue(resolved);
  pickerProps.setIsOpen(false);
};
```

### `resolveVariables` — FE side
```typescript
// packages/types hoặc utils:
export function resolveVariables(
  body: string,
  ctx: { requesterName: string; requestCode: string; assigneeName: string }
): string {
  return body
    .replace(/\{\{requester_name\}\}/g, ctx.requesterName)
    .replace(/\{\{request_code\}\}/g,   ctx.requestCode)
    .replace(/\{\{assignee_name\}\}/g,  ctx.assigneeName);
}
```

### `CannedResponseForm.tsx` — fields
```text
- title:    TextField (required, max 100)
- shortcut: TextField (optional, prefix "/" readonly, max 30, a-z0-9_-)
            Hiển thị: "/" + [input] → shortcut = "reset-password" → dùng "/reset-password"
- category: TextField (optional)
- tags:     Chip input (optional)
- body:     TextField multiline (required, max 5000)
            Preview button → hiện resolved preview với dummy context
- Submit: Save

Dùng FormDialog (kiểm tra packages/ui đã có chưa)
```

### `CannedResponseView.tsx`
```text
- Table: Title | Shortcut | Category | Actions (Edit/Delete)
- Create button (chỉ OPS_COORDINATOR+)
- Edit/Delete: chỉ OPS_COORDINATOR+
- Empty state khi chưa có response nào
```

---

## i18n keys
```json
"cannedResponses": {
  "title": "Canned Responses",
  "new": "New Canned Response",
  "shortcut": "Shortcut",
  "shortcutHint": "Type /shortcut in comments to use",
  "body": "Response Content",
  "preview": "Preview",
  "picker": {
    "placeholder": "Type to search...",
    "empty": "No matching responses"
  },
  "variables": {
    "hint": "Available variables: {{requester_name}}, {{request_code}}, {{assignee_name}}"
  }
}
```

---

## Test cases bắt buộc
```text
✓ Gõ "/" → picker mở
✓ Gõ "/res" → filter đúng
✓ Esc → picker đóng
✓ Chọn response → text được replace + variables resolved
✓ resolveVariables: thay thế đúng tất cả {{placeholders}}
✓ CannedResponseForm: shortcut validate format a-z0-9_-
✓ EMPLOYEE không thấy menu Settings > Canned Responses
```

## Quality gate
```bash
pnpm --filter @supportops/web test CannedResponse
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-506**
