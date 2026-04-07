# TASK-502 — Frontend: Components

**Phase:** 4 — Frontend (bước 2)
**Depends on:** TASK-501 (service + hook), TASK-101 (types)
**Blocks:** TASK-601

---

## Mục tiêu

Implement tất cả UI components cho import flow. Tất cả components nằm trong:

```
apps/web/src/features/service-ops/requests/components/import/
├── ImportRequestButton.tsx     ← ~25 lines
├── ImportRequestModal.tsx      ← ~100 lines  (dùng FormDialog)
├── ImportUploadStep.tsx        ← ~90 lines   (dùng FileUploadField)
├── ImportPreviewStep.tsx       ← ~100 lines
├── ImportPreviewTable.tsx      ← ~90 lines   (MUI Table với checkbox)
└── ImportResultStep.tsx        ← ~60 lines
```

Sau đó wiring vào `RequestListView.tsx`.

**Component tree:**
```
RequestListView.tsx
  └── ImportRequestButton.tsx          ← hiện theo permission
      └── ImportRequestModal.tsx       ← orchestrator, dùng FormDialog
          ├── ImportUploadStep.tsx     ← file dropzone + template download
          ├── ImportPreviewStep.tsx    ← preview table + confirm action
          │   └── ImportPreviewTable.tsx
          └── ImportResultStep.tsx    ← kết quả sau import
```

---

## UI Package rules (bắt buộc kiểm tra trước khi code)

| Cần | Dùng |
|---|---|
| Modal/dialog | `FormDialog` từ `@supportops/ui-dialog` + `useDialog` từ `@supportops/ui` |
| File upload | `FileUploadField` từ `@supportops/ui-file-upload` |
| Toast / notification | `useToast` từ `@supportops/ui` |
| Form fields | `@supportops/ui-form` |

---

## 1. `ImportRequestButton.tsx` — ~25 lines

```typescript
// 'use client'
// Props: none
// Hiển thị nút "Import" chỉ khi user có permission 'request.import'
// Khi click → mở ImportRequestModal (dùng useDialog từ @supportops/ui)
// i18n: t('requests.import.button')
```

Logic:
- Dùng hook permissions hiện có (tìm trong codebase: `usePermissions` hoặc `useAuth`) để check `request.import`
- Nếu không có permission → return `null` (không render gì)

---

## 2. `ImportRequestModal.tsx` — ~100 lines

```typescript
// 'use client'
// Props: { open: boolean; onClose: () => void }
// Dùng FormDialog từ @supportops/ui-dialog
// Inject useImportRequests hook
// Render đúng step dựa vào hook.step:
//   'upload'     → <ImportUploadStep>
//   'processing' → loading state với text t('requests.import.processing.title')
//   'preview'    → <ImportPreviewStep>
//   'result'     → <ImportResultStep>
// onClose → hook.reset() + gọi prop onClose
```

---

## 3. `ImportUploadStep.tsx` — ~90 lines

```typescript
// Props: { onUpload: (file: File) => void; onDownloadTemplate: (format: 'csv' | 'xlsx') => void; isUploading: boolean; error: string | null }
// Dùng FileUploadField từ @supportops/ui-file-upload
// Client-side validation trước khi gọi onUpload:
//   - File size > 5MB → hiển thị error t('requests.import.error.fileTooLarge'), KHÔNG upload
//   - File type không phải .csv hoặc .xlsx → hiển thị error t('requests.import.error.invalidFormat')
// 2 nút download template: "CSV" và "Excel"
// Hint text: t('requests.import.upload.hint') = "Max 5MB · Max 500 rows · CSV or .xlsx"
```

---

## 4. `ImportPreviewStep.tsx` — ~100 lines

```typescript
// Props: {
//   preview: ImportPreviewResult;
//   skippedRows: Set<number>;
//   onToggleRow: (index: number) => void;
//   onConfirm: () => void;
//   isConfirming: boolean;
// }
// Hiển thị summary:
//   - t('requests.import.preview.validRows', { count: preview.validRows })
//   - t('requests.import.preview.errorRows', { count: preview.errorRows.length })
//   - t('requests.import.preview.warningRows', { count: preview.warningRows.length })
// Render <ImportPreviewTable>
// Nút confirm: t('requests.import.preview.confirmButton', { count: confirmedCount })
//   confirmedCount = tổng rows KHÔNG nằm trong skippedRows
//   (không đếm error rows vì chúng không thể được tick)
```

---

## 5. `ImportPreviewTable.tsx` — ~90 lines

```typescript
// Props: {
//   errorRows: ImportRowError[];      // đỏ, không thể tick
//   warningRows: ImportRowWarning[];  // vàng, mặc định KHÔNG tick (trong skippedRows)
//   validRowCount: number;            // trắng, luôn được tick (không hiển thị riêng từng row valid)
//   skippedRows: Set<number>;         // rows đang bị bỏ qua
//   onToggleRow: (index: number) => void;
// }
```

**Màu sắc:**
- Row đỏ (`error`): validation error — checkbox disabled + checked = false — không thể include
- Row vàng (`warning`): duplicate warning — checkbox unchecked by default (đã trong `skippedRows`) — coordinator có thể tick để include
- Row trắng: valid — không hiển thị individual rows (chỉ hiển thị count)

**Behavior checkbox:**
- Error rows: `disabled={true}`, `checked={false}` — không interact
- Warning rows: `checked={!skippedRows.has(row.row)}` — toggle được
- Khi coordinator tick 1 warning row → gọi `onToggleRow(row.row)` → hook xóa row đó khỏi `skippedRows`

**Column layout (MUI Table):**
| # | Loại | Thông tin lỗi / cảnh báo |
|---|---|---|
| Row number | Error/Warning badge | Message |

> Không cần show toàn bộ data content của từng row — chỉ cần row number + type + message.

---

## 6. `ImportResultStep.tsx` — ~60 lines

```typescript
// Props: { result: BulkImportResult; onClose: () => void }
// Hiển thị:
//   - t('requests.import.result.success', { count: result.created })
//   - t('requests.import.result.errors', { count: result.failed })
//   - Danh sách errors: t('requests.import.result.errorDetail', { row, message })
// Nút "Close" → gọi onClose
```

---

## 7. i18n — SỬA `en.json` + `vi.json`

Tìm đường dẫn file i18n trong `apps/web/` (thường là `src/messages/en.json` hoặc `public/locales/en/`).

Thêm tất cả keys sau vào cả 2 file:

**en.json:**
```json
{
  "requests.import.button": "Import",
  "requests.import.modal.title": "Import Service Requests",
  "requests.import.upload.title": "Upload CSV or Excel file",
  "requests.import.upload.hint": "Max 5MB · Max 500 rows · CSV or .xlsx",
  "requests.import.upload.downloadTemplate": "Download Template",
  "requests.import.processing.title": "Processing import...",
  "requests.import.processing.hint": "You will receive a notification when done.",
  "requests.import.result.success": "{{count}} requests created successfully",
  "requests.import.result.errors": "{{count}} rows failed",
  "requests.import.result.errorDetail": "Row {{row}}: {{message}}",
  "requests.import.preview.title": "Review before importing",
  "requests.import.preview.validRows": "{{count}} rows ready to import",
  "requests.import.preview.errorRows": "{{count}} rows with errors (will be skipped)",
  "requests.import.preview.warningRows": "{{count}} possible duplicates",
  "requests.import.preview.duplicateInFile": "Duplicate row within this file",
  "requests.import.preview.duplicateRecent": "Similar request created in the last 24 hours",
  "requests.import.preview.confirmButton": "Import {{count}} rows",
  "requests.import.error.fileTooLarge": "File must be under 5MB",
  "requests.import.error.invalidFormat": "Only .csv and .xlsx files are supported",
  "requests.import.error.reporterNotFound": "Reporter email '{{email}}' is not a member of this tenant"
}
```

**vi.json** — bản dịch tiếng Việt:
```json
{
  "requests.import.button": "Import",
  "requests.import.modal.title": "Import Service Requests",
  "requests.import.upload.title": "Tải lên file CSV hoặc Excel",
  "requests.import.upload.hint": "Tối đa 5MB · 500 dòng · CSV hoặc .xlsx",
  "requests.import.upload.downloadTemplate": "Tải template",
  "requests.import.processing.title": "Đang xử lý import...",
  "requests.import.processing.hint": "Bạn sẽ nhận thông báo khi hoàn tất.",
  "requests.import.result.success": "{{count}} requests đã được tạo thành công",
  "requests.import.result.errors": "{{count}} dòng lỗi",
  "requests.import.result.errorDetail": "Dòng {{row}}: {{message}}",
  "requests.import.preview.title": "Xem trước trước khi import",
  "requests.import.preview.validRows": "{{count}} dòng sẵn sàng import",
  "requests.import.preview.errorRows": "{{count}} dòng lỗi (sẽ bị bỏ qua)",
  "requests.import.preview.warningRows": "{{count}} dòng có thể trùng lặp",
  "requests.import.preview.duplicateInFile": "Dòng trùng lặp trong file này",
  "requests.import.preview.duplicateRecent": "Request tương tự đã được tạo trong 24 giờ qua",
  "requests.import.preview.confirmButton": "Import {{count}} dòng",
  "requests.import.error.fileTooLarge": "File phải dưới 5MB",
  "requests.import.error.invalidFormat": "Chỉ chấp nhận file .csv và .xlsx",
  "requests.import.error.reporterNotFound": "Email '{{email}}' không phải thành viên của tenant"
}
```

---

## 8. SỬA `RequestListView.tsx`

Tìm file hiện tại tại `apps/web/src/features/service-ops/requests/components/`. Đọc file trước.

Thêm `<ImportRequestButton>` vào toolbar/header của trang Requests List:

```typescript
import { ImportRequestButton } from './import/ImportRequestButton';

// Trong JSX (bên cạnh nút Create / các action khác):
<ImportRequestButton />
```

> **Không thêm gì khác vào `RequestListView.tsx`** — button tự quản lý permission check và modal state bên trong nó.

---

## Component Tests — TẠO MỚI

Tạo `__tests__/` hoặc `*.test.tsx` bên cạnh mỗi component (theo convention hiện có của codebase).

| Component | Test cases tối thiểu |
|---|---|
| `ImportRequestButton` | Visible với `request.import` permission; ẩn với EMPLOYEE role |
| `ImportUploadStep` | File > 5MB → client-side error trước khi upload; .xlsx → accepted; .txt → rejected |
| `ImportPreviewTable` | Error rows = đỏ + disabled checkbox; warning rows = vàng + unchecked; valid rows trắng + checked; toggle warning row → `onToggleRow` được gọi |
| `ImportPreviewStep` | Confirm button count đúng; click → gọi `onConfirm` |
| `ImportResultStep` | Hiển thị created / failed; "Close" → gọi `onClose` |
| `useImportRequests` | idle→uploading; polling stop khi `preview_ready`; toggle row cập nhật `skippedRows`; confirm gọi service với đúng `skipRowIndices` |

---

## Quality Gate

```bash
pnpm --filter @supportops/web build
pnpm --filter @supportops/web test
```

**Cả hai phải pass 0 errors trước khi báo Done.**

---

## Checklist

- [ ] `ImportRequestButton.tsx` — ẩn nếu không có `request.import`
- [ ] `ImportRequestModal.tsx` — dùng `FormDialog`, render đúng step
- [ ] `ImportUploadStep.tsx` — client-side validate size + type, 2 nút template
- [ ] `ImportPreviewStep.tsx` — summary counts + confirm button với count đúng
- [ ] `ImportPreviewTable.tsx` — error đỏ disabled, warning vàng unchecked, toggle behavior
- [ ] `ImportResultStep.tsx` — hiển thị created/failed/errors, Close button
- [ ] `en.json` + `vi.json` — tất cả 20 keys đã thêm
- [ ] `RequestListView.tsx` — `<ImportRequestButton />` đã thêm vào toolbar
- [ ] Tất cả component tests tạo mới (6 components)
- [ ] Không có component nào vượt size limit (25/100/90/100/90/60 lines)
- [ ] Không tạo component mới nếu `@supportops/ui-*` đã có sẵn
- [ ] `pnpm --filter @supportops/web build` → PASS
- [ ] `pnpm --filter @supportops/web test` → PASS
- [ ] `_STATUS.md` cập nhật → ✅ Done
