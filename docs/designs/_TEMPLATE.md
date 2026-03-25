# DESIGN-XXXXX — [Tên feature]

> **Ngày tạo:** YYYY-MM-DD
> **Tạo bởi:** Tech Lead Agent
> **Status:** Draft | Review | Approved
> **Requirement:** [REQ-XXXXX.md](../requirements/REQ-XXXXX.md)
> **Task tracking:** [AGENT_TASKS.md](../AGENT_TASKS.md) — Task X.X

---

## 1. Overview

_(Mô tả ngắn gọn giải pháp kỹ thuật — 2-3 câu)_

---

## 2. API Design

### 2.1 New Endpoints

```
METHOD /api/v1/[path]
Auth: Bearer JWT (required)
Permission: [permission name]

Request:
{
  "field": "type"
}

Response 200:
{
  "data": { ... }
}

Response 4xx:
{
  "error": { "code": "...", "message": "..." }
}
```

### 2.2 Modified Endpoints

_(Nếu có — mô tả thay đổi breaking/non-breaking)_

---

## 3. Database Changes

### 3.1 Schema Changes

```prisma
// Thêm vào schema.prisma nếu cần
model NewModel {
  id        String   @id @default(uuid())
  tenantId  String
  // ...
}
```

> **Nếu không có thay đổi schema:** "No migration required — aggregate from existing tables."

### 3.2 New Prisma Queries

```typescript
// Pseudo-code cho queries phức tạp
prisma.serviceRequest.groupBy({
  by: ['status'],
  _count: true,
  where: { tenantId },
})
```

---

## 4. Types Contract

_(Thêm vào `packages/types/` trước khi implement)_

```typescript
// packages/types/src/...

export interface NewResponseDto {
  field: string
}

export interface NewRequestDto {
  field: string
}
```

---

## 5. Frontend Architecture

### 5.1 Route & Page

```
apps/web/src/app/[locale]/(dashboard)/[route]/
  └── page.tsx          ← Server component, pass params
```

### 5.2 Component Tree

```
PageComponent
  └── FeatureView         ← Client component (state, hooks)
      ├── SectionA
      └── SectionB
```

### 5.3 Hook & Service

```
features/[name]/
  ├── hooks/
  │   └── use[FeatureName].ts
  ├── services/
  │   └── [feature].service.ts
  └── components/
      └── [Component].tsx
```

---

## 6. Implementation Order

> Thực hiện theo thứ tự này để tránh breaking changes:

1. [ ] **Step 1:** Update `packages/types/` — thêm types mới
2. [ ] **Step 2:** Backend — implement service + controller
3. [ ] **Step 3:** Frontend — implement hook + service
4. [ ] **Step 4:** Frontend — build UI components
5. [ ] **Step 5:** Wire end-to-end + smoke test

---

## 7. Risks & Constraints

| Risk | Mức độ | Mitigation |
|---|---|---|
| _(mô tả risk)_ | Low / Med / High | _(cách giảm thiểu)_ |

---

## 8. Forbidden Actions

- [ ] KHÔNG tạo migration mới nếu không cần thiết
- [ ] KHÔNG sửa legacy modules (`Product`, `Kanban`, `Billing`, v.v.)
- [ ] KHÔNG thêm npm dependency mới mà không confirm với PO
- [ ] KHÔNG bỏ `tenantId` filter trên bất kỳ query nào
