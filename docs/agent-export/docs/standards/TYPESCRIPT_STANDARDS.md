# TypeScript Standards — SupportOps
# Version: 1.0

Áp dụng cho toàn bộ codebase: `apps/web`, `apps/api`, `apps/worker`, `packages/*`.

---

## 1. Naming Conventions

| Loại | Convention | Ví dụ |
|---|---|---|
| Component | PascalCase | `RequestCard`, `ActivityTimeline` |
| Hook | camelCase, prefix `use` | `useRequestList`, `useDialog` |
| Service (FE) | camelCase, suffix `.service` | `requests.service.ts` |
| Service (BE) | PascalCase class, suffix `Service` | `RequestService` |
| Controller | PascalCase, suffix `Controller` | `RequestController` |
| DTO | PascalCase, suffix `Dto` | `CreateRequestDto` |
| Interface | PascalCase, NO prefix `I` | `RequestDetail`, KHÔNG phải `IRequestDetail` |
| Type alias | PascalCase | `RequestStatus`, `PaginatedResponse<T>` |
| Enum | PascalCase (name) + SCREAMING_SNAKE_CASE (values) | `enum RequestStatus { IN_PROGRESS = 'IN_PROGRESS' }` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |
| File (FE component) | PascalCase.tsx | `RequestCard.tsx` |
| File (FE hook/util/service) | camelCase.ts | `useRequests.ts`, `requests.service.ts` |
| File (BE module) | kebab-case | `request.service.ts`, `create-request.dto.ts` |
| Event handler prop | prefix `on` | `onSubmit`, `onClose`, `onDelete` |
| Event handler function | prefix `handle` | `handleSubmit`, `handleClose` |

---

## 2. Type vs Interface

```typescript
// ✅ Dùng interface cho object shapes
interface RequestCard {
  id: string;
  title: string;
  status: RequestStatus;
}

// ✅ Dùng type cho unions, intersections, conditionals
type RequestStatus = 'DRAFT' | 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED';
type ApiResponse<T> = { data: T } | { error: ApiError };
type PartialRequest = Partial<RequestCard> & { id: string };

// ❌ Không dùng interface cho unions
interface RequestStatus { /* wrong */ }
```

---

## 3. No `any` — Zero Tolerance

```typescript
// ❌ Tuyệt đối không
const data: any = response;
function process(input: any) { ... }

// ✅ Dùng unknown + narrow
function parseApiResponse(raw: unknown): RequestDetail {
  if (!isRequestDetail(raw)) throw new Error('Invalid shape');
  return raw;
}

// ✅ Dùng generics thay vì any
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

// ✅ Nếu thực sự không biết type của third-party → dùng type assertion với comment lý do
const legacy = (thirdPartyLib as { result: string }).result; // reason: no @types available
```

---

## 4. Strict Mode — Bắt buộc

Tất cả `tsconfig.json` phải có:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 5. Optional vs Nullable

```typescript
// ✅ optional property (có thể không có key này)
interface RequestFilter {
  assigneeId?: string;
}

// ✅ nullable (có key nhưng giá trị có thể null)
interface RequestDetail {
  resolvedAt: Date | null;
  assignee: UserSummary | null;
}

// ❌ Không dùng undefined khi backend trả null
interface Bad {
  resolvedAt?: Date; // sai nếu backend trả về null
}
```

---

## 6. Generics — Patterns hay dùng

```typescript
// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  meta: PageMeta;
}

// API response wrapper
interface ApiResponse<T> {
  data: T;
}

// Form field options
interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// ✅ Constrain generics khi có thể
function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
```

---

## 7. Zod Integration

```typescript
// ✅ Schema là source of truth — infer type từ schema
import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().optional(),
  serviceTypeId: z.string().uuid(),
});

// Infer type từ schema, KHÔNG viết interface riêng
export type CreateRequestInput = z.infer<typeof createRequestSchema>;

// ❌ Tránh viết interface trùng với schema
interface CreateRequestInput { // sai — duplicate
  title: string;
  priority: string;
}
```

---

## 8. Barrel Exports

```typescript
// ✅ Mỗi module có index.ts để export
// features/requests/index.ts
export { RequestCard } from './components/RequestCard';
export { useRequests } from './hooks/useRequests';
export type { RequestFilter } from './types';

// ✅ Import từ barrel, không import sâu vào internals
import { RequestCard } from '@/features/requests';

// ❌ Không import sâu vào file cụ thể từ bên ngoài module
import { RequestCard } from '@/features/requests/components/RequestCard/index';
```

---

## 9. Enum vs Union Type

```typescript
// ✅ Dùng union string type khi giá trị đến từ API (packages/types)
type RequestStatus = 'DRAFT' | 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

// ✅ Dùng const enum hoặc plain enum khi cần iterate hoặc reverse-lookup
enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NOT_FOUND = 404,
}

// ❌ Không dùng enum cho API contracts — JSON không hiểu enum TS
enum RequestStatus { DRAFT = 'DRAFT' } // gây friction khi parse JSON
```

---

## 10. Return Types — Bắt buộc cho public functions

```typescript
// ✅ Functions được export phải có return type tường minh
export function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN');
}

// ✅ Async functions
export async function fetchRequests(filter: RequestFilter): Promise<PaginatedResponse<RequestSummary>> {
  ...
}

// ✅ Components — return type để TS bắt lỗi sớm
export function RequestCard({ request }: RequestCardProps): React.JSX.Element {
  ...
}

// ❌ Không để infer return type cho exported functions (khó debug khi type thay đổi)
export function getStatus() { // sai
  return someComplexExpression;
}
```

---

## 11. Type Assertions — Chỉ dùng khi không tránh được

```typescript
// ✅ Cho phép với comment giải thích
const element = document.getElementById('root') as HTMLDivElement; // guaranteed by HTML structure

// ✅ Non-null assertion với comment
const user = getUser()!; // caller guarantees user exists in this context

// ❌ Không dùng để bypass type error
const data = (response as any).result; // tuyệt đối không
```

---

## 12. Utility Types — Sử dụng đúng cách

```typescript
// ✅ Partial — optional tất cả fields (dùng cho update/patch)
type UpdateRequestDto = Partial<CreateRequestDto>;

// ✅ Pick — chọn subset fields
type RequestSummary = Pick<RequestDetail, 'id' | 'title' | 'status' | 'createdAt'>;

// ✅ Omit — loại bỏ fields
type RequestWithoutMeta = Omit<RequestDetail, 'createdAt' | 'updatedAt'>;

// ✅ Record — map type
type StatusLabelMap = Record<RequestStatus, string>;
const statusLabels: StatusLabelMap = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  // TS sẽ báo nếu thiếu key
};

// ✅ Readonly — cho config/constants
const DEFAULT_FILTERS = {
  page: 1,
  size: 20,
  status: 'SUBMITTED',
} as const satisfies RequestFilter;
```
