# Package Boundaries

## Scope
Tài liệu này chốt ranh giới package hiện tại của monorepo để tránh tách package không cần thiết trong giai đoạn ổn định kiến trúc.

## Package Matrix
| Package | Status | Ownership | Có thể tách thêm? |
|---|---|---|---|
| `@supportops/types` | STABLE | Shared | Không |
| `@supportops/ui` | STABLE | Frontend | Không |
| `@supportops/ui-form` | STABLE | Frontend | Không |
| `@supportops/ui-theme` | STABLE | Frontend | Không |
| `@supportops/ui-avatar` | STABLE | Frontend | Không |
| `@supportops/ui-file-upload` | STABLE | Frontend | Không |
| `@supportops/ui-dialog` | STABLE | Frontend | Không |
| `@supportops/eslint-config` | STABLE | Tooling | Không |
| `@supportops/tsconfig` | STABLE | Tooling | Không |

## Freeze Rule
Không tạo package mới trong `packages/` trừ khi:
1. Có ít nhất 2 consumers độc lập.
2. Có approval rõ ràng trong task/PR scope.

## Dependency Direction
1. `apps/*` có thể phụ thuộc `packages/*`.
2. `packages/*` không được import ngược từ `apps/*`.
3. `@supportops/types` không chứa runtime business logic.
