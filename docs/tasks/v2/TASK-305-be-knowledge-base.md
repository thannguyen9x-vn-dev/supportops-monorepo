# TASK-305 — BE: Knowledge Base Module
> **Phase:** 3 — Backend | **Prereq:** TASK-201 done (KnowledgeArticle model đã migrate)

---

## Files cần tạo

```text
apps/api/src/modules/knowledge-base/
├── knowledge-base.module.ts
├── knowledge-base.controller.ts
├── knowledge-base.controller.spec.ts
├── knowledge-base.service.ts
├── knowledge-base.service.spec.ts
└── dto/
    ├── create-knowledge-article.dto.ts
    ├── update-knowledge-article.dto.ts
    ├── knowledge-article-query.dto.ts
    └── knowledge-article-response.dto.ts
```

---

## Spec chi tiết

### Endpoints
| Method | Path | Guard |
|---|---|---|
| GET | `/knowledge-base` | Auth |
| POST | `/knowledge-base` | Auth + `knowledge-base.create` |
| GET | `/knowledge-base/search` | Auth (for picker) |
| GET | `/knowledge-base/:id` | Auth |
| PUT | `/knowledge-base/:id` | Auth + `knowledge-base.update` |
| PATCH | `/knowledge-base/:id/publish` | Auth + `knowledge-base.publish` |
| PATCH | `/knowledge-base/:id/unpublish` | Auth + `knowledge-base.publish` |
| DELETE | `/knowledge-base/:id` | Auth + `knowledge-base.delete` |

### RBAC data scope
```typescript
// Trong service.findAll():
if (userRole === 'EMPLOYEE') {
  where.status = 'PUBLISHED';  // EMPLOYEE chỉ thấy published
  where.isDeleted = false;
}
// TECHNICIAN+ thấy tất cả (kể cả DRAFT)
```

### Full-text search (cho picker)
```typescript
// GET /knowledge-base/search?q=reset+password
// Dùng PostgreSQL ILIKE cho đơn giản (full tsvector nếu cần)
where: {
  tenantId,
  isDeleted: false,
  status: 'PUBLISHED',
  OR: [
    { title: { contains: q, mode: 'insensitive' } },
    { body:  { contains: q, mode: 'insensitive' } },
  ]
}
```

### Soft delete
```typescript
// DELETE không xóa row — chỉ set isDeleted=true
delete(tenantId, id, userId) {
  // check ownership nếu TECHNICIAN
  return prisma.knowledgeArticle.update({
    where: { id, tenantId },
    data: { isDeleted: true },
  });
}
```

---

## Test cases bắt buộc
```text
✓ EMPLOYEE chỉ thấy PUBLISHED articles (không thấy DRAFT)
✓ EMPLOYEE không thể tạo article (403)
✓ TECHNICIAN chỉ edit/delete own article
✓ OPS_COORDINATOR edit/delete bất kỳ article
✓ Search: trả về kết quả theo q
✓ Soft delete: isDeleted=true, không hiện trong findAll
✓ tenantId isolation: tenant A không thấy bài của tenant B
```

## Quality gate
```bash
pnpm --filter @supportops/api test knowledge-base
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-306**
