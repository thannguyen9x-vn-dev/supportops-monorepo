# TASK-201 — DB Migration (Prisma schema + migrate)
> **Phase:** 2 — Database
> **Prereq:** TASK-101–105 done + `pnpm typecheck` PASS

---

## Mục tiêu
Cập nhật `apps/api/prisma/schema.prisma` với tất cả models/enums mới cho V2, sau đó chạy migration.

---

## Checklist trước khi sửa schema

```text
[ ] Backup hoặc commit clean state trước khi sửa
[ ] Tất cả new fields phải nullable HOẶC có @default → không break data cũ
[ ] Không xóa field cũ trong UserPreference (giữ 8 legacy fields)
[ ] Kiểm tra WorkflowTransition seeds sau khi thêm WAITING_FOR_CUSTOMER
```

---

## Thay đổi schema — theo thứ tự

### 1. Enum `RequestStatus` — thêm 1 value
```prisma
enum RequestStatus {
  // ... giữ nguyên tất cả values hiện có ...
  WAITING_FOR_CUSTOMER   // ← NEW: SLA pauses khi request ở status này
}
```

### 2. Enum mới
```prisma
enum NotificationEventType {
  REQUEST_CREATED
  REQUEST_ASSIGNED
  REQUEST_STATUS_CHANGED
  REQUEST_COMMENTED
  REQUEST_MENTIONED
  SLA_NEAR_BREACH_RESPONSE
  SLA_NEAR_BREACH_RESOLUTION
}

enum NotificationChannel {
  IN_APP
  EMAIL
}

enum KnowledgeBaseStatus {
  DRAFT
  PUBLISHED
}
```

### 3. Model `Notification`
```prisma
model Notification {
  id        String                @id @default(uuid())
  tenantId  String
  userId    String
  type      NotificationEventType
  title     String
  body      String
  requestId String?
  actorId   String?
  metadata  Json?
  isRead    Boolean               @default(false)
  readAt    DateTime?
  createdAt DateTime              @default(now())

  tenant  Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user    User   @relation(fields: [userId],   references: [id], onDelete: Cascade)

  @@index([tenantId, userId, isRead, createdAt])
  @@index([tenantId, requestId])
}
```

### 4. Model `NotificationPreference`
```prisma
model NotificationPreference {
  id        String                @id @default(uuid())
  tenantId  String
  userId    String
  eventType NotificationEventType
  inApp     Boolean               @default(true)
  email     Boolean               @default(true)
  createdAt DateTime              @default(now())
  updatedAt DateTime              @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId],   references: [id], onDelete: Cascade)

  @@unique([userId, eventType])
  @@index([tenantId, userId])
}
```

### 5. Model `RequestWatcher`
```prisma
model RequestWatcher {
  id        String   @id @default(uuid())
  tenantId  String
  requestId String
  userId    String
  autoWatch Boolean  @default(false)
  createdAt DateTime @default(now())

  tenant  Tenant         @relation(fields: [tenantId],  references: [id], onDelete: Cascade)
  request ServiceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  user    User           @relation(fields: [userId],    references: [id], onDelete: Cascade)

  @@unique([requestId, userId])
  @@index([tenantId, requestId])
  @@index([tenantId, userId])
}
```

### 6. Model `KnowledgeArticle`
```prisma
model KnowledgeArticle {
  id        String              @id @default(uuid())
  tenantId  String
  title     String
  body      String
  category  String?
  tags      String[]
  status    KnowledgeBaseStatus @default(DRAFT)
  authorId  String
  isDeleted Boolean             @default(false)
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  author User   @relation(fields: [authorId], references: [id], onDelete: Restrict)

  @@index([tenantId, status, isDeleted])
  @@index([tenantId, category])
}
```

### 7. Model `CannedResponse`
```prisma
model CannedResponse {
  id        String   @id @default(uuid())
  tenantId  String
  title     String
  body      String
  category  String?
  tags      String[]
  shortcut  String?
  isDeleted Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, shortcut])
  @@index([tenantId, isDeleted])
}
```

### 8. Model `SlaRecord` — thêm 2 fields
```prisma
model SlaRecord {
  // ... giữ nguyên tất cả fields hiện có ...
  totalPausedSeconds   Int       @default(0)   // ← NEW: tổng thời gian đã pause
  nearBreachNotifiedAt DateTime?               // ← NEW: idempotency guard
}
```

### 9. Model `SlaPolicy` — thêm 1 field
```prisma
model SlaPolicy {
  // ... giữ nguyên tất cả fields hiện có ...
  nearBreachThresholdMinutes Int @default(30)  // ← NEW
}
```

### 10. Relations — thêm vào Tenant, User, ServiceRequest
```prisma
// Trong model Tenant — append:
notifications            Notification[]
notificationPreferences  NotificationPreference[]
watchers                 RequestWatcher[]
knowledgeArticles        KnowledgeArticle[]
cannedResponses          CannedResponse[]

// Trong model User — append:
notifications            Notification[]
notificationPreferences  NotificationPreference[]
watchedRequests          RequestWatcher[]
knowledgeArticles        KnowledgeArticle[]

// Trong model ServiceRequest — append:
watchers                 RequestWatcher[]
```

---

## Chạy migration

```bash
pnpm --filter @supportops/api prisma migrate dev \
  --name add_v2_notification_kb_canned_sla_watcher
```

---

## ⚠️ GATE:
```bash
pnpm --filter @supportops/api prisma migrate dev   # PASS
pnpm --filter @supportops/api prisma validate      # 0 errors
pnpm typecheck                                      # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-202**
