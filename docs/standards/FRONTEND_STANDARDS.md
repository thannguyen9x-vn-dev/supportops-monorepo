# Frontend Standards — SupportOps
# Version: 1.0

Áp dụng cho `apps/web`. Đọc thêm `apps/web/AGENTS.md` cho architecture overview.

---

## 1. Component Size — Giới hạn cứng

| Loại file | Giới hạn | Hành động khi vượt |
|---|---|---|
| `page.tsx` (route) | ≤ 50 lines | Tách toàn bộ UI vào `[Module]View.tsx` |
| View component (`*View.tsx`) | ≤ 150 lines | Tách thành section components |
| Section component | ≤ 100 lines | Tách thành sub-components |
| Custom hook (`use*.ts`) | ≤ 120 lines | Tách hook con hoặc service |
| Service file (`*.service.ts`) | ≤ 80 lines | Tách theo resource |

> **Tại sao?** File dài = nhiều responsibilities = khó test, khó review, dễ conflict khi nhiều agent làm song song.

---

## 2. Component Splitting Rules

### Quy tắc tách
1. **1 responsibility = 1 file** — ActivityTimeline, Comments, WorkLog, Sidebar → file riêng
2. **Props drilling > 2 cấp** → dùng custom hook hoặc context
3. **Logic > 10 lines trong JSX** → tách vào hook
4. **Render function lặp lại** → tách thành sub-component
5. **Mỗi file chỉ export 1 component** (trừ barrel `index.ts`)

### Cấu trúc chuẩn cho feature phức tạp

```text
features/[module]/
├── components/
│   ├── [Module]View.tsx          ← Orchestrator (client), gọi sections, ≤ 150 lines
│   ├── [Module]Header.tsx        ← Header / actions bar
│   ├── [Module]Section.tsx       ← Mỗi section lớn = 1 file
│   └── [SubFeature]/
│       ├── [SubFeature]Panel.tsx ← Container của sub-feature
│       └── [SubFeature]Form.tsx  ← Form riêng nếu có
├── hooks/
│   └── use[Module].ts            ← State + data fetching + mutations
├── services/
│   └── [module].service.ts       ← API calls (browser)
│   └── [module].server.ts        ← API calls (server component)
└── index.ts                      ← Barrel export
```

### Ví dụ đúng — Request Detail

```text
features/service-ops/requests/components/detail/
├── RequestDetailView.tsx      ← ~80 lines, orchestrates
├── RequestDetailHeader.tsx    ← status badge, workflow actions
├── RequestOverviewPanel.tsx   ← serviceType, location, description
├── RequestMetaSidebar.tsx     ← tags, impact, urgency, assignee
├── activity/
│   ├── ActivityTimeline.tsx   ← container
│   └── ActivityItem.tsx       ← single item renderer
├── comments/
│   ├── CommentsPanel.tsx      ← list + form container
│   └── CommentForm.tsx        ← form only
└── worklog/
    ├── WorkLogPanel.tsx
    └── WorkLogForm.tsx
```

---

## 3. Loading State Pattern

**Quy tắc:** Mọi data-fetching component PHẢI có loading state. Không bao giờ render `undefined` data ra UI.

```tsx
// ✅ Pattern chuẩn với TanStack Query
function RequestList() {
  const { data, isLoading, isError } = useRequestList();

  if (isLoading) return <RequestListSkeleton />;  // skeleton, không spinner
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data?.data.length) return <EmptyState />;

  return <RequestTable requests={data.data} />;
}

// ✅ Skeleton — dùng MUI Skeleton, match layout thật
function RequestListSkeleton() {
  return (
    <Stack spacing={1}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={64} />
      ))}
    </Stack>
  );
}

// ❌ Không dùng spinner toàn trang (gây CLS)
if (isLoading) return <CircularProgress />; // tránh cho list/table

// ❌ Không render với data undefined
return <RequestCard request={data!} />; // sai nếu không guard
```

---

## 4. Error State Pattern

```tsx
// ✅ Error state component chuẩn
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <Box textAlign="center" py={4}>
      <Typography color="error">{message}</Typography>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </Box>
  );
}

// ✅ Dùng trong component
if (isError) return <ErrorState onRetry={refetch} />;
```

---

## 5. Empty State Pattern

```tsx
// ✅ Empty state phải có context — không chỉ "No data"
function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <Box textAlign="center" py={6}>
      <Typography variant="h6">No requests found</Typography>
      <Typography color="text.secondary">
        Submit a new request to get started
      </Typography>
      {onCreate && (
        <Button variant="contained" onClick={onCreate} sx={{ mt: 2 }}>
          New Request
        </Button>
      )}
    </Box>
  );
}
```

---

## 6. Form Pattern — React Hook Form + Zod

```tsx
// ✅ Pattern chuẩn — schema → type → form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRequestSchema, type CreateRequestInput } from '@supportops/types';
import { TextInputField, SelectOptionField } from '@supportops/ui-form';

function CreateRequestForm({ onSubmit }: { onSubmit: (data: CreateRequestInput) => void }) {
  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TextInputField name="title" form={form} label="Title" required />
      <SelectOptionField
        name="priority"
        form={form}
        label="Priority"
        options={priorityOptions}
      />
      <Button type="submit" loading={form.formState.isSubmitting}>
        Submit
      </Button>
    </form>
  );
}

// ❌ Không tự viết controlled inputs khi đã có @supportops/ui-form
<TextField value={title} onChange={e => setTitle(e.target.value)} /> // sai
```

---

## 7. Data Fetching — TanStack Query

```typescript
// ✅ Custom hook chuẩn
export function useRequestList(filter: RequestFilter) {
  return useQuery({
    queryKey: ['requests', filter],
    queryFn: () => requestsService.getList(filter),
    staleTime: 30_000, // 30s
  });
}

// ✅ Mutation chuẩn
export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error) => {
      // error handling — hiện toast hoặc set form error
    },
  });
}

// ✅ Query key factory — tránh string magic
export const requestKeys = {
  all: ['requests'] as const,
  list: (filter: RequestFilter) => ['requests', 'list', filter] as const,
  detail: (id: string) => ['requests', 'detail', id] as const,
};
```

---

## 8. i18n — next-intl

```typescript
// ✅ Mọi UI text PHẢI qua next-intl
import { useTranslations } from 'next-intl';

function RequestCard() {
  const t = useTranslations('requests');
  return <Typography>{t('statusLabels.submitted')}</Typography>;
}

// ✅ Server component
import { getTranslations } from 'next-intl/server';

async function RequestPage() {
  const t = await getTranslations('requests');
  return <h1>{t('pageTitle')}</h1>;
}

// ❌ Hardcode string
return <Typography>Submitted</Typography>; // sai
return <Typography>{'requests.status.submitted'}</Typography>; // sai
```

---

## 9. Navigation & URL State

```typescript
// ✅ URL-driven state cho filters/pagination — không useState
import { useRouter, useSearchParams } from 'next/navigation';

function RequestFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', status);
    params.set('page', '1'); // reset page khi filter thay đổi
    router.push(`?${params.toString()}`);
  };
}

// ✅ Dùng router.refresh() sau mutation để revalidate Server Component
const { mutateAsync } = useUpdateRequest();
await mutateAsync(data);
router.refresh();

// ❌ Không dùng useState cho filter nếu cần share qua URL
const [status, setStatus] = useState('SUBMITTED'); // sai cho filters
```

---

## 10. Server Component vs Client Component

```typescript
// ✅ Default: Server Component — không cần 'use client'
// Dùng khi: hiển thị data, không có event handlers, không dùng hooks

// ✅ Thêm 'use client' chỉ khi cần:
// - useState, useEffect, useRef
// - Event handlers (onClick, onChange)
// - Browser APIs (localStorage, window)
// - Third-party client-only libs

'use client';
export function RequestDetailView() { ... }

// ✅ Pattern: Server shell + Client island
// page.tsx (Server) → fetch data → pass to [Module]View.tsx (Client)
async function RequestDetailPage({ params }) {
  const request = await requestsServer.getById(params.id); // server fetch
  return <RequestDetailView request={request} />; // client component
}
```

---

## 11. API Service Pattern

```typescript
// ✅ Service layer — KHÔNG gọi apiClient trực tiếp trong component/hook
// apps/web/src/features/requests/services/requests.service.ts

import { apiClient } from '@/lib/api/apiClient';
import { API_ENDPOINTS } from '@supportops/types';
import type { RequestFilter, PaginatedResponse, RequestSummary } from '@supportops/types';

export const requestsService = {
  async getList(filter: RequestFilter): Promise<PaginatedResponse<RequestSummary>> {
    const { data } = await apiClient.get(API_ENDPOINTS.requests.list, { params: filter });
    return data;
  },

  async getById(id: string): Promise<RequestDetail> {
    const { data } = await apiClient.get(API_ENDPOINTS.requests.detail(id));
    return data.data;
  },

  async create(body: CreateRequestInput): Promise<RequestDetail> {
    const { data } = await apiClient.post(API_ENDPOINTS.requests.create, body);
    return data.data;
  },
};
```

---

## 12. Props Interface Rules

```tsx
// ✅ Luôn đặt tên interface, đặt ngay trên component
interface RequestCardProps {
  request: RequestSummary;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export function RequestCard({ request, onSelect, isSelected = false }: RequestCardProps) {
  ...
}

// ❌ Không dùng anonymous props
export function RequestCard({ request }: { request: RequestSummary }) { ... } // sai

// ❌ Không extend HTML element props trừ khi làm wrapper
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { } // chỉ cho wrapper
```

---

## 13. Forbidden Patterns

| Pattern | Lý do | Thay thế |
|---|---|---|
| `import apiClient` trong component | Vi phạm layer architecture | Dùng service → hook |
| `useState` cho server data | Mất sync với server | TanStack Query |
| Inline styles phức tạp | Khó maintain | MUI `sx` prop hoặc styled |
| `document.getElementById` trong component | Breaks SSR | Dùng `useRef` |
| `localStorage` trực tiếp | Breaks SSR | Dùng `useLocalStorage` hook hoặc cookie |
| Tạo component UI khi đã có trong `packages/ui` | Duplicate code | Import từ `@supportops/ui-*` |
| Component file > giới hạn | Quá nhiều responsibilities | Tách file theo rules trên |
| Hardcode string UI text | Không i18n được | `useTranslations` |
| `console.log` trong code commit | Dev noise | Xóa trước commit |
