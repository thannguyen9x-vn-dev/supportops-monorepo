# Testing Standards — SupportOps
# Version: 1.0

Áp dụng cho toàn bộ codebase. Frontend dùng Jest + RTL + MSW. Backend dùng Jest + NestJS Testing.

---

## 1. Test File Location

| Layer | File | Vị trí |
|---|---|---|
| FE Component | `RequestCard.test.tsx` | Cùng folder với component |
| FE Hook | `useRequests.test.ts` | Cùng folder với hook |
| FE Service | Không test unit — test qua hook | — |
| BE Service | `request.service.spec.ts` | Cùng folder với service |
| BE Controller | `request.controller.spec.ts` | Cùng folder với controller |
| BE Integration | `request.e2e-spec.ts` | `apps/api/test/` |

---

## 2. Naming Conventions

```typescript
// ✅ Pattern chuẩn
describe('RequestCard', () => {
  describe('when request is submitted', () => {
    it('renders the submitted status badge', () => { ... });
    it('shows the submission date', () => { ... });
  });

  describe('when user clicks select', () => {
    it('calls onSelect with the request id', () => { ... });
  });
});

// ✅ Backend — rõ context
describe('RequestService', () => {
  describe('create', () => {
    it('creates a request with DRAFT status when submitNow is false', () => { ... });
    it('throws NotFoundException when serviceType does not exist in tenant', () => { ... });
    it('throws ForbiddenException when user lacks request.create permission', () => { ... });
  });
});

// ❌ Tránh tên mơ hồ
it('works correctly'); // sai
it('test request'); // sai
it('should work'); // sai
```

---

## 3. Frontend — Component Testing

### Quy tắc bắt buộc

```
[ ] Mỗi component PHẢI có file .test.tsx
[ ] Tối thiểu: 1 render test + 1 interaction test
[ ] Dùng Testing Library queries theo đúng priority
[ ] KHÔNG test implementation details
[ ] KHÔNG snapshot test
[ ] KHÔNG mock component con (trừ khi có side effects)
```

### Query Priority (theo Testing Library guidelines)

```typescript
// 1. getByRole — ưu tiên cao nhất (semantic + accessible)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('heading', { name: /request detail/i });
screen.getByRole('textbox', { name: /title/i });

// 2. getByLabelText — cho form fields
screen.getByLabelText(/request title/i);

// 3. getByPlaceholderText — khi không có label
screen.getByPlaceholderText(/search requests/i);

// 4. getByText — cho non-interactive text
screen.getByText('Submitted');

// 5. getByTestId — CUỐI CÙNG, chỉ khi không có cách khác
screen.getByTestId('request-status-badge'); // thêm data-testid vào component

// ❌ Không dùng class/id selector
document.querySelector('.request-card'); // sai
document.getElementById('submit-btn'); // sai
```

### Component Test Pattern

```tsx
// ✅ Pattern chuẩn — render + assert + interact
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestCard } from './RequestCard';
import { mockRequest } from '@/__tests__/factories/request.factory';

describe('RequestCard', () => {
  const defaultProps = {
    request: mockRequest({ status: 'SUBMITTED' }),
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders request title', () => {
    render(<RequestCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.request.title)).toBeInTheDocument();
  });

  it('renders submitted status badge', () => {
    render(<RequestCard {...defaultProps} />);
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('calls onSelect with request id when clicked', async () => {
    const user = userEvent.setup();
    render(<RequestCard {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /select request/i }));

    expect(defaultProps.onSelect).toHaveBeenCalledWith(defaultProps.request.id);
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Test Pattern

```typescript
// ✅ Hook test với renderHook + MSW
import { renderHook, waitFor } from '@testing-library/react';
import { useRequestList } from './useRequestList';
import { createWrapper } from '@/__tests__/helpers/createWrapper';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

describe('useRequestList', () => {
  it('returns requests on successful fetch', async () => {
    server.use(
      http.get('/api/requests', () => {
        return HttpResponse.json({
          data: [mockRequest()],
          meta: { page: 1, size: 20, total: 1, totalPages: 1 },
        });
      }),
    );

    const { result } = renderHook(
      () => useRequestList({ page: 1, size: 20 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
  });

  it('sets isError on fetch failure', async () => {
    server.use(
      http.get('/api/requests', () => HttpResponse.error()),
    );

    const { result } = renderHook(
      () => useRequestList({ page: 1 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

---

## 4. Backend — Service Testing

```typescript
// ✅ Service test: mock Prisma, test business logic
describe('RequestService', () => {
  let service: RequestService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RequestService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get(RequestService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('creates request with DRAFT status when submitNow is false', async () => {
      const tenantId = 'tenant-1';
      const userId = 'user-1';
      const dto = makeCreateRequestDto({ submitNow: false });

      prisma.serviceType.findFirst.mockResolvedValue(mockServiceType({ tenantId }));
      prisma.serviceRequest.create.mockResolvedValue(mockServiceRequest({ status: 'DRAFT' }));

      const result = await service.create(tenantId, userId, dto);

      expect(result.status).toBe('DRAFT');
      expect(prisma.serviceRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'DRAFT' }) }),
      );
    });

    it('throws NotFoundException when serviceType not found in tenant', async () => {
      prisma.serviceType.findFirst.mockResolvedValue(null);

      await expect(
        service.create('tenant-1', 'user-1', makeCreateRequestDto()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## 5. Backend — Controller Testing

```typescript
// ✅ Controller test: mock Service, test HTTP layer
describe('RequestController', () => {
  let controller: RequestController;
  let service: jest.Mocked<RequestService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [RequestController],
      providers: [
        { provide: RequestService, useValue: { create: jest.fn(), findAll: jest.fn() } },
      ],
    }).compile();

    controller = module.get(RequestController);
    service = module.get(RequestService);
  });

  it('calls service.create with correct params', async () => {
    const dto = makeCreateRequestDto();
    service.create.mockResolvedValue(mockRequestResponse());

    await controller.create('tenant-1', 'user-1', dto);

    expect(service.create).toHaveBeenCalledWith('tenant-1', 'user-1', dto);
  });
});
```

---

## 6. Test Data Factories

```typescript
// ✅ Dùng factory functions — không hardcode test data
// apps/web/src/__tests__/factories/request.factory.ts

export function mockRequest(overrides?: Partial<RequestSummary>): RequestSummary {
  return {
    id: 'req-' + Math.random().toString(36).slice(2),
    title: 'Test Request',
    status: 'SUBMITTED',
    priority: 'MEDIUM',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function mockRequestDetail(overrides?: Partial<RequestDetail>): RequestDetail {
  return {
    ...mockRequest(),
    description: 'Test description',
    assignee: null,
    comments: [],
    activities: [],
    ...overrides,
  };
}

// ✅ Factory usage
const submitted = mockRequest({ status: 'SUBMITTED' });
const withAssignee = mockRequest({ assignee: mockUser() });
```

---

## 7. MSW Setup — API Mocking

```typescript
// ✅ MSW handler pattern
// apps/web/src/__tests__/mocks/handlers/requests.ts
import { http, HttpResponse } from 'msw';
import { API_ENDPOINTS } from '@supportops/types';

export const requestHandlers = [
  http.get(API_ENDPOINTS.requests.list, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    return HttpResponse.json({
      data: [mockRequest({ status: status as RequestStatus ?? 'SUBMITTED' })],
      meta: { page: 1, size: 20, total: 1, totalPages: 1 },
    });
  }),

  http.post(API_ENDPOINTS.requests.create, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: mockRequestDetail(body as Partial<RequestDetail>) }, { status: 201 });
  }),
];

// ✅ Override handler trong test
server.use(
  http.get(API_ENDPOINTS.requests.list, () => HttpResponse.json({ data: [], meta: { total: 0 } })),
);
```

---

## 8. What to Test vs What to Skip

### PHẢI test

```
✅ Component renders đúng với props cơ bản
✅ Interaction (click, type, submit) trigger đúng callback
✅ Loading state hiển thị khi isLoading = true
✅ Error state hiển thị khi isError = true
✅ Empty state hiển thị khi data = []
✅ Service business logic (điều kiện, validation, side effects)
✅ Service error cases (not found, forbidden, conflict)
✅ Pagination calculation (skip, take, totalPages)
```

### KHÔNG cần test

```
❌ Implementation details (state variable names, internal methods)
❌ Snapshot test (brittle, breaks mọi UI change nhỏ)
❌ Styling/CSS (không thể test ý nghĩa design qua unit test)
❌ Third-party library behavior (MUI, TanStack) — họ đã test rồi
❌ Type definitions (TypeScript compiler làm việc này)
❌ Prisma queries trực tiếp (test qua service logic)
❌ Simple passthrough — controller chỉ gọi service → test service thôi
```

---

## 9. Test Commands

```bash
# Frontend — chạy tất cả
pnpm --filter @supportops/web test

# Frontend — watch mode
pnpm --filter @supportops/web test --watch

# Frontend — specific file
pnpm --filter @supportops/web test -- --testPathPattern="RequestCard"

# Frontend — không coverage (nhanh hơn khi dev)
pnpm --filter @supportops/web test -- --no-coverage

# Backend
pnpm --filter @supportops/api test

# Backend — specific
pnpm --filter @supportops/api test -- --testPathPattern="request.service"
```

---

## 10. Definition of Done cho Testing

Trước khi báo "xong" một task, phải pass:

```
[ ] Tất cả component mới có .test.tsx file
[ ] Tất cả service method mới có .spec.ts coverage
[ ] pnpm --filter @supportops/web test — 0 failures
[ ] pnpm --filter @supportops/api test — 0 failures
[ ] pnpm typecheck — 0 errors
[ ] pnpm lint — 0 errors
```
