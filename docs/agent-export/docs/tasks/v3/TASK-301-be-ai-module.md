# TASK-301 — BE: AI Module (proxy + settings CRUD)
> **Phase:** 3 — Backend | **Prereq:** TASK-201 done | **Status:** ✅ Done

---

## Mục tiêu

Tạo NestJS module `apps/api/src/modules/ai/` đóng vai proxy: verify JWT → inject tenantId → forward request sang Python AI Service. Cung cấp thêm CRUD endpoint cho tenant AI settings (model preference).

---

## Files cần tạo / sửa

```text
apps/api/src/modules/ai/
├── ai.module.ts
├── ai.controller.ts
├── ai.service.ts
└── dto/
    ├── ask-request.dto.ts
    ├── ask-response.dto.ts
    ├── ai-settings-response.dto.ts
    └── update-ai-settings.dto.ts

apps/api/src/app.module.ts              ← MODIFIED (import AiModule)
apps/api/.env (hoặc .env.example)      ← MODIFIED (thêm AI_SERVICE_URL)
```

---

## Spec chi tiết

### Endpoints

| Method | Path | Guard | Permission |
|---|---|---|---|
| POST | `/api/v1/ai/ask` | Auth | `ai.ask` |
| GET | `/api/v1/ai/settings` | Auth | `ai.ask` |
| PATCH | `/api/v1/ai/settings` | Auth | `ai.ask` |

### `ai.controller.ts`

```typescript
@Controller('ai')
@UseGuards(AuthGuard, PermissionsGuard)
export class AiController {
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @Permissions({ all: ['ai.ask'] })
  ask(
    @CurrentTenant() tenantId: string,
    @Body() dto: AskRequestDto,
  ): Promise<AskResponseDto>

  @Get('settings')
  @Permissions({ all: ['ai.ask'] })
  getSettings(
    @CurrentTenant() tenantId: string,
  ): Promise<AiSettingsResponseDto>

  @Patch('settings')
  @Permissions({ all: ['ai.ask'] })
  updateSettings(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateAiSettingsDto,
  ): Promise<AiSettingsResponseDto>
}
```

### `ai.service.ts` — methods

```typescript
ask(tenantId: string, dto: AskRequestDto): Promise<AskResponseDto>
// 1. getSettings(tenantId) để lấy model preference (fallback DEFAULT_AI_MODEL)
// 2. fetch(`${AI_SERVICE_URL}/ask`, { method: 'POST', headers: { 'x-tenant-id': tenantId }, body: JSON.stringify({ ...dto, model: dto.model ?? settings.defaultModel }) })
// 3. AbortSignal.timeout(30000)
// 4. Nếu fetch fail → throw ServiceUnavailableException('AI_SERVICE_UNAVAILABLE')

getSettings(tenantId: string): Promise<AiSettingsResponseDto>
// prisma.tenantAiSettings.findUnique({ where: { tenantId } })
// Nếu null → trả { defaultModel: DEFAULT_AI_MODEL }

updateSettings(tenantId: string, dto: UpdateAiSettingsDto): Promise<AiSettingsResponseDto>
// prisma.tenantAiSettings.upsert({ where: { tenantId }, create: { tenantId, ...dto }, update: dto })
```

### DTOs

```typescript
// ask-request.dto.ts
export class AskRequestDto {
  @IsString() @IsNotEmpty() message: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ChatMessageDto)
  history: ChatMessageDto[];
  @IsOptional() @IsIn(AI_MODEL_IDS) model?: AiModelId;
}

// update-ai-settings.dto.ts
export class UpdateAiSettingsDto {
  @IsIn(AI_MODEL_IDS) defaultModel: AiModelId;
}
```

### Security checklist

- [x] `tenantId` từ `@CurrentTenant()` (JWT) — KHÔNG tin body
- [x] `x-tenant-id` header inject vào request sang AI Service
- [x] `@Permissions({ all: ['ai.ask'] })` trên mọi endpoint — 403 với role khác TENANT_ADMIN
- [x] AI_SERVICE_URL chỉ từ env — không hardcode
- [x] AbortSignal.timeout(30000) — không để request treo mãi
- [x] ServiceUnavailableException khi AI Service down

### Environment variable

```env
# apps/api/.env
AI_SERVICE_URL=http://localhost:8000   # local dev
# AI_SERVICE_URL=http://ai-service:8000  # production (docker-compose)
```

---

## Quality gate

```bash
pnpm --filter @supportops/api build   # 0 errors
pnpm typecheck                         # 0 errors
pnpm lint                              # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-401**
