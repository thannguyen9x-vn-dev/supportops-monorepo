# Route Map

Updated: 2026-03-22

## Public

| Route | Area | Status |
|---|---|---|
| `/login` | Auth | ✅ Done |
| `/register` | Auth | ✅ Done |
| `/forgot-password` | Auth | ✅ Done |
| `/reset-password` | Auth | ✅ Done |
| `/verify-email` | Auth | ✅ Done |
| `/auth-support` | Auth | ✅ Done |

## Authenticated

| Route | Area | Status |
|---|---|---|
| `/dashboard` | Dashboard | ✅ Done |
| `/requests/list` | Requests List | 🔶 In Progress |
| `/requests/create` | Create Request | ✅ Done |
| `/requests/[id]` | Request Detail | ✅ Done |
| `/team` | Team Management | ✅ Done |
| `/settings/profile` | User Profile | ✅ Done |
| `/settings/workflow` | Workflow Settings | ✅ Done |
| `/settings/sla` | SLA Settings | ✅ Done |
| `/settings/service-types` | Service Type Settings | ✅ Done |

## Notes

- Settings routes are intended for `TENANT_ADMIN`.
- Requests list remains active for ongoing UX/consistency refinements.
- Route status aligns with `docs/mvp-status.md` and `docs/AGENT_TASKS.md`.
