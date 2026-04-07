# TASK-601 — Wire + Smoke Test

**Phase:** 5 — Wire + Smoke Test
**Depends on:** TASK-502 (FE), TASK-401 (BE), TASK-301 (Worker), TASK-201 (DB)
**Blocks:** —

---

## Mục tiêu

Verify toàn bộ flow end-to-end hoạt động đúng, chạy full quality gate, đảm bảo không có type error hay lint error trên toàn monorepo trước khi merge.

---

## Acceptance Criteria cần verify (từ REQ-00005.md)

Verify từng AC bằng cách test thủ công hoặc kiểm tra code đã implement đúng:

| AC | Mô tả | Verify bằng |
|---|---|---|
| AC-001 | EMPLOYEE không thể gọi import API (403) | Test thủ công hoặc `request-import.service.spec.ts` |
| AC-002 | OPS_COORDINATOR và TENANT_ADMIN thấy nút "Import" trên Requests List | Test thủ công trên browser |
| AC-003 | Download template CSV có đúng columns, 1 row ví dụ | Download + kiểm tra file |
| AC-004 | Upload CSV hợp lệ → hiển thị preview table | Test thủ công (cần worker đang chạy) |
| AC-005 | Row với serviceTypeCode không hợp lệ → highlight đỏ trong preview | Test thủ công |
| AC-006 | Confirm import → rows hợp lệ được tạo với đúng tenantId | Kiểm tra DB hoặc service test |
| AC-007 | Import result modal hiển thị X thành công, Y lỗi | Test thủ công |
| AC-008 | File > 5MB → rejected client-side trước khi upload | Test thủ công với file lớn |
| AC-009 | `POST /requests/bulk` với 3 items hợp lệ → 3 requests, `{ created: 3, failed: 0 }` | `request-bulk.service.spec.ts` |
| AC-010 | `POST /requests/bulk` với item thiếu title → item đó lỗi, các item khác created | `request-bulk.service.spec.ts` |
| AC-011 | Upload file → API trả về `{ jobId, status: 'queued' }` ngay lập tức | `request-import.service.spec.ts` |
| AC-011b | Worker xử lý async; user nhận notification với kết quả | Test thủ công (cần worker chạy) |
| AC-011c | Import audit log ghi nhận userId, tenantId, timestamp, counts | Kiểm tra DB `AuditLog` table |
| AC-012 | `pnpm typecheck` pass toàn monorepo | Quality gate bên dưới |
| AC-013 | `pnpm lint` pass toàn monorepo | Quality gate bên dưới |
| AC-014 | Tất cả UI text import có trong `en.json` và `vi.json` | Kiểm tra key list trong TASK-502 |

---

## Smoke Test Flows

### Flow A — File Import (Phương án A)

**Prerequisite:** Worker đang chạy (`apps/worker`), Redis + MinIO up.

```
1. Login với OPS_COORDINATOR account
2. Vào trang Requests List
3. Click nút "Import" → modal mở
4. Click "Download Template" → CSV download, kiểm tra headers đúng
5. Điền 3 rows hợp lệ + 1 row serviceTypeCode sai vào CSV
6. Upload file → UI hiển thị "Processing import..."
7. Sau ≤ 3s polling → preview hiển thị:
   - 3 rows trắng (valid)
   - 1 row đỏ (error, bị disabled checkbox)
8. Click "Import 3 rows" (4 rows nhưng 1 bị skip auto)
9. Kết quả: modal result hiển thị "3 requests created, 1 failed"
10. Kiểm tra in-app notification hiển thị
11. Kiểm tra DB: 3 ServiceRequest mới với đúng tenantId từ JWT
```

### Flow B — JSON Bulk API (Phương án B)

```bash
# Dùng curl hoặc Postman
curl -X POST http://localhost:8081/api/v1/requests/bulk \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "title": "Test bulk import 1",
        "serviceTypeCode": "IT_HARDWARE",
        "priority": "HIGH",
        "locationId": "<valid_location_id>"
      },
      {
        "title": "Test bulk import 2",
        "serviceTypeCode": "IT_HARDWARE",
        "priority": "MEDIUM",
        "locationId": "<valid_location_id>"
      }
    ]
  }'

# Expected response:
# { "data": { "created": 2, "failed": 0, "errors": [] } }
```

### Flow C — Duplicate Warning

```
1. Upload CSV với 2 rows có cùng title + serviceTypeCode + reporterEmail
2. Preview: row thứ 2 highlighted vàng (duplicate warning, mặc định không tick)
3. Coordinator tick lại row vàng để override
4. Confirm → cả 2 rows được tạo
```

### Flow D — EMPLOYEE Role Check

```
1. Login với EMPLOYEE account
2. Kiểm tra: nút "Import" không hiển thị trên Requests List
3. Gọi trực tiếp API: POST /requests/import/upload
4. Expected: 403 Forbidden
```

---

## Quality Gate bắt buộc

```bash
# Full typecheck toàn monorepo
pnpm typecheck

# Full lint toàn monorepo
pnpm lint
```

**Cả hai phải pass 0 errors/warnings trước khi merge.**

---

## Nếu phát hiện bug

1. Ghi rõ AC nào fail
2. Tìm file/line liên quan
3. Fix bug → re-run quality gate
4. Không merge nếu còn AC chưa pass

---

## Checklist

- [ ] Tất cả ACs từ AC-001 đến AC-014 đã verify
- [ ] Flow A (file import) smoke test pass
- [ ] Flow B (JSON bulk) smoke test pass
- [ ] Flow C (duplicate warning) smoke test pass
- [ ] Flow D (EMPLOYEE 403) smoke test pass
- [ ] `pnpm typecheck` → PASS (0 errors)
- [ ] `pnpm lint` → PASS (0 errors)
- [ ] `_STATUS.md` cập nhật tất cả tasks → ✅ Done
