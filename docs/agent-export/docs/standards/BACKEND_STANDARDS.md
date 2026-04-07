# Backend Standards — SupportOps
# Version: 1.0

Áp dụng cho `apps/api`. Đọc thêm `apps/api/AGENTS.md` cho architecture overview.

---

## 1. Module Checklist — Trước khi tạo module mới

Trước khi implement bất kỳ module nào, phải có đầy đủ:

```
[ ] Requirement đã được approve (REQ file tồn tại)
[ ] Design đã được approve (DESIGN file tồn tại)
[ ] Types đã được định nghĩa trong packages/types/
[ ] Prisma migration đã được review nếu cần schema mới
[ ] Permissions đã được định nghĩa trong DESIGN
```

---

## 2. Module File Structure

```text
modules/<feature>/
├── <feature>.module.ts          ← @Module, import/export
├── <feature>.controller.ts      ← HTTP handlers chỉ (parse → call service → return)
├── <feature>.service.ts         ← Business logic
├── <feature>.service.spec.ts    ← Unit tests cho service
├── <feature>.controller.spec.ts ← Unit tests cho controller
└── dto/
    ├── create-<feature>.dto.ts
    ├── update-<feature>.dto.ts
    └── <feature>-response.dto.ts
```

> Không được thêm business logic vào file nào ngoài `*.service.ts`.

---

## 3. Controller Pattern — Thin Controller

```typescript
// ✅ Controller chỉ làm: parse → validate → call service → return
@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RequestController {

  constructor(private readonly requestService: RequestService) {}

  @Post()
  @Permissions({ all: ['request.create'] })
  @ApiOperation({ summary: 'Create a service request' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateRequestDto,
  ) {
    return this.requestService.create(tenantId, userId, dto);
  }

  @Get(':id')
  @Permissions({ any: ['request.read.all', 'request.read.own'] })
  findOne(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.requestService.findOne(tenantId, userId, id);
  }
}

// ❌ Không viết business logic trong controller
@Get(':id')
async findOne(@Param('id') id: string) {
  const req = await this.prisma.serviceRequest.findFirst({ where: { id } }); // sai
  if (!req) throw new Error('not found'); // sai
  return req; // sai — trả raw Prisma object
}
```

---

## 4. Service Pattern — Business Logic

```typescript
// ✅ Service nhận tenantId + userId, áp dụng business rules
@Injectable()
export class RequestService {

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateRequestDto): Promise<RequestResponseDto> {
    // 1. Validate business rules
    const serviceType = await this.prisma.serviceType.findFirst({
      where: { id: dto.serviceTypeId, tenantId },
    });
    if (!serviceType) throw new NotFoundException('SERVICE_TYPE_NOT_FOUND', 'Service type not found');

    // 2. Execute
    const request = await this.prisma.serviceRequest.create({
      data: {
        ...dto,
        tenantId,
        submittedById: userId,
        status: dto.submitNow ? 'SUBMITTED' : 'DRAFT',
      },
    });

    // 3. Side effects (fire-and-forget hoặc await nếu cần)
    await this.auditService.log({ tenantId, action: 'REQUEST_CREATED', resourceId: request.id });

    // 4. Return mapped response DTO (không return raw Prisma object)
    return this.mapToResponseDto(request);
  }

  // ✅ Private mapper — không return raw Prisma
  private mapToResponseDto(request: ServiceRequest & { assignee?: User | null }): RequestResponseDto {
    return {
      id: request.id,
      title: request.title,
      status: request.status as RequestStatus,
      // ... các fields khác
    };
  }
}
```

---

## 5. Multi-Tenancy — Bắt buộc 100%

```typescript
// ✅ Mọi query trên tenant-scoped data PHẢI có tenantId
async findAll(tenantId: string, filter: RequestFilter) {
  return this.prisma.serviceRequest.findMany({
    where: {
      tenantId,       // ← BẮT BUỘC
      status: filter.status,
      assigneeId: filter.assigneeId,
    },
  });
}

// ✅ Update/Delete cũng phải có tenantId
async update(tenantId: string, id: string, dto: UpdateRequestDto) {
  const existing = await this.prisma.serviceRequest.findFirst({
    where: { id, tenantId }, // verify ownership trước
  });
  if (!existing) throw new NotFoundException('REQUEST_NOT_FOUND', 'Request not found');

  return this.prisma.serviceRequest.update({
    where: { id },
    data: dto,
  });
}

// ❌ Query thiếu tenantId — lỗi bảo mật nghiêm trọng
async findById(id: string) {
  return this.prisma.serviceRequest.findFirst({ where: { id } }); // DATA LEAK RISK
}
```

---

## 6. DTO Validation

```typescript
// ✅ DTO chuẩn — class-validator + class-transformer + Swagger
import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ description: 'Request title', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ enum: RequestPriority })
  @IsEnum(RequestPriority)
  priority: RequestPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  serviceTypeId: string;
}

// ❌ Không bao giờ dùng plain object cho body
@Post()
create(@Body() body: any) { ... } // sai hoàn toàn
```

---

## 7. Exception Handling

```typescript
// ✅ Dùng typed exceptions từ common/exceptions
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { BadRequestException } from '../../../common/exceptions/bad-request.exception';

throw new NotFoundException('REQUEST_NOT_FOUND', 'Request not found');
throw new ForbiddenException('TRANSITION_NOT_ALLOWED', 'Cannot perform this transition');
throw new ConflictException('SERVICE_TYPE_CODE_EXISTS', 'Service type code already exists');
throw new BadRequestException('INVALID_STATUS', 'Cannot close a draft request');

// ❌ Không throw raw Error hoặc HttpException
throw new Error('not found');
throw new HttpException('Forbidden', 403);

// ✅ Error codes phải là SCREAMING_SNAKE_CASE, descriptive
// Pattern: NOUN_VERB hoặc NOUN_STATE
// Ví dụ: REQUEST_NOT_FOUND, SERVICE_TYPE_CODE_EXISTS, TRANSITION_NOT_ALLOWED
```

---

## 8. Permissions Guard

```typescript
// ✅ Mọi endpoint phải có @Permissions hoặc @Public
@Post()
@Permissions({ all: ['request.create'] })          // phải có TẤT CẢ permissions này
create(...) { ... }

@Get()
@Permissions({ any: ['request.read.all', 'request.read.own'] }) // có ÍT NHẤT 1
findAll(...) { ... }

@Get('health')
@Public()                                          // không cần auth
healthCheck() { ... }

// ✅ Permissions scope trong DESIGN file — không tự decide trong khi code
```

---

## 9. Response Format — Không wrap thủ công

```typescript
// ✅ Chỉ return data — interceptor tự wrap thành { data: ... }
@Get(':id')
findOne(...) {
  return this.requestService.findOne(...); // return trực tiếp
}

// ✅ Paginated — return { data: T[], meta: PageMeta }
@Get()
findAll(...): Promise<PaginatedResponse<RequestSummary>> {
  return this.requestService.findAll(...);
}

// ❌ Không manually wrap
return { data: result }; // interceptor sẽ double-wrap thành { data: { data: result } }
```

---

## 10. Pagination Pattern

```typescript
// ✅ Query DTO chuẩn
export class RequestListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 20;
}

// ✅ Service implementation
async findAll(tenantId: string, query: RequestListQueryDto): Promise<PaginatedResponse<RequestSummary>> {
  const { page = 1, size = 20 } = query;
  const skip = (page - 1) * size;

  const [items, total] = await this.prisma.$transaction([
    this.prisma.serviceRequest.findMany({
      where: { tenantId },
      skip,
      take: size,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.serviceRequest.count({ where: { tenantId } }),
  ]);

  return {
    data: items.map(this.mapToSummary),
    meta: {
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
    },
  };
}
```

---

## 11. Swagger Documentation — Bắt buộc

```typescript
// ✅ Tất cả controller phải có ApiTags
@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('requests')

// ✅ Tất cả endpoint phải có ApiOperation
@ApiOperation({ summary: 'List service requests', description: 'Paginated list with filters' })
@ApiQuery({ name: 'status', enum: RequestStatus, required: false })
@ApiResponse({ status: 200, type: RequestListResponseDto })
@Get()
findAll(...) { ... }

// ✅ Tất cả DTO fields phải có @ApiProperty
@ApiProperty({ description: 'Title of the request', example: 'Laptop not working' })
title: string;
```

---

## 12. Prisma Best Practices

```typescript
// ✅ Dùng $transaction cho multiple writes
const [request, _activity] = await this.prisma.$transaction([
  this.prisma.serviceRequest.update({ where: { id }, data: { status } }),
  this.prisma.requestActivity.create({ data: { requestId: id, type: 'STATUS_CHANGED' } }),
]);

// ✅ Select chỉ fields cần thiết
const request = await this.prisma.serviceRequest.findFirst({
  where: { id, tenantId },
  select: {
    id: true,
    title: true,
    status: true,
    assignee: { select: { id: true, firstName: true, lastName: true } },
  },
});

// ✅ Dùng Prisma.XxxGetPayload cho typed includes
type RequestWithAssignee = Prisma.ServiceRequestGetPayload<{
  include: { assignee: { select: { id: true; firstName: true; lastName: true } } };
}>;

// ❌ Không dùng raw SQL trừ khi Prisma không support
this.prisma.$queryRaw`SELECT * FROM requests`; // chỉ dùng khi thực sự cần
```

---

## 13. Audit Logging

```typescript
// ✅ Log tất cả state changes quan trọng
// Khi nào cần log: status change, assignment, comment create, setting change
await this.auditService.log({
  tenantId,
  userId,
  action: 'REQUEST_STATUS_CHANGED',
  resourceType: 'ServiceRequest',
  resourceId: request.id,
  meta: { from: oldStatus, to: newStatus },
});

// Danh sách actions cần log (không bỏ sót):
// REQUEST_CREATED, REQUEST_SUBMITTED, REQUEST_ASSIGNED, REQUEST_REASSIGNED
// REQUEST_STATUS_CHANGED, REQUEST_RESOLVED, REQUEST_CLOSED
// COMMENT_ADDED, WORK_LOG_ADDED
// SETTING_CHANGED (workflow, SLA, service types)
```

---

## 14. Security Checklist — Mỗi endpoint mới

```
[ ] Có @UseGuards(JwtAuthGuard, PermissionsGuard) chưa?
[ ] Có @Permissions() với đúng permission chưa?
[ ] tenantId được lấy từ @CurrentTenant(), KHÔNG từ body?
[ ] Tất cả Prisma queries có tenantId filter chưa?
[ ] DTO có đầy đủ class-validator decorators chưa?
[ ] Không return raw Prisma object (phải qua response DTO)?
[ ] Không expose sensitive fields (password, token)?
[ ] Lỗi có dùng typed exception (không lộ stack trace)?
```

---

## 15. Forbidden Actions

| Action | Lý do |
|---|---|
| Query không có `tenantId` | Data leak giữa tenants |
| Logic trong Controller | Breaks single responsibility |
| Return raw Prisma object | Expose internal schema, sensitive fields |
| Throw `new Error()` hoặc `new HttpException()` | Dùng typed app exceptions |
| Bypass `@Permissions()` với check thủ công trong service | Không nhất quán với guard system |
| Sửa legacy modules (billing, invoice, kanban) | Đã deprecated, phase out |
| Thêm role mới | Chưa có requirement |
| Dùng `any` | Strict TypeScript |
| `console.log` trong production code | Dùng Pino logger |
