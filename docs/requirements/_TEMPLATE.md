# REQ-XXXXX — [Tên feature]

> **Ngày tạo:** YYYY-MM-DD
> **Tạo bởi:** BA Agent
> **Status:** Draft | Review | Approved
> **Tech Lead Design:** [DESIGN-XXXXX.md](../designs/DESIGN-XXXXX.md) ← điền khi có
> **Task tracking:** [AGENT_TASKS.md](../AGENT_TASKS.md) — Task X.X

---

## 1. Brief Requirement (Input từ PO)

> _(Copy nguyên văn brief của PO vào đây)_

---

## 2. Context & Background

- **Module liên quan:** [tên module trong domain map]
- **Trạng thái hiện tại:** ❌ TODO / 🔶 In Progress / ✅ Done
- **Constraint:** _(dependencies, RBAC rules, tenant isolation, v.v.)_

---

## 3. Detailed Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | _(mô tả yêu cầu)_ | Must Have |
| FR-002 | ... | Should Have |
| FR-003 | ... | Nice to Have |

### 3.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-001 | _(performance, security, i18n, v.v.)_ |

---

## 4. Acceptance Criteria

```
Given [context]
When  [action]
Then  [expected result]
```

- [ ] AC-001: ...
- [ ] AC-002: ...
- [ ] AC-003: i18n — tất cả text có trong `en.json` + `vi.json`
- [ ] AC-004: `pnpm typecheck` pass
- [ ] AC-005: `pnpm lint` pass

---

## 5. Scope Boundaries

**IN SCOPE:**
- ...

**OUT OF SCOPE (không làm trong task này):**
- ...

---

## 6. Affected Modules

| Layer | Package / Path | Loại thay đổi |
|---|---|---|
| Frontend | `apps/web/src/features/...` | New / Modify |
| Backend | `apps/api/src/modules/...` | New / Modify |
| Types | `packages/types/src/...` | New / Modify |
| DB Schema | `apps/api/prisma/schema.prisma` | None / Migration |

---

## 7. Open Questions

| # | Câu hỏi | BLOCKER? | Trả lời |
|---|---|---|---|
| Q1 | _(câu hỏi chưa rõ)_ | YES / NO | _(điền sau)_ |

---

## 8. Risks

| Risk | Mức độ | Mitigation |
|---|---|---|
| _(mô tả risk)_ | Low / Med / High | _(cách giảm thiểu)_ |
