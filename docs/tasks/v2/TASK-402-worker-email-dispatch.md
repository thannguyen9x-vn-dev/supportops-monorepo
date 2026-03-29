# TASK-402 — Worker: Email Dispatch (Immediate + Digest)
> **Phase:** 4 — Worker
> **Prereq:** TASK-000 done + TASK-304 (fan-out enqueues email jobs)

---

## Mục tiêu
Xử lý 2 email queues:
- `email.immediate` — gửi ngay (assignment, mention, SLA breach)
- `email.digest` — buffer 5 phút rồi gom thành 1 email (created, status changed, comment)

---

## Files cần tạo

```text
apps/worker/src/jobs/
└── email-dispatch.job.ts     ← TẠO MỚI

apps/worker/src/
└── templates/
    ├── email-immediate.template.ts   ← TẠO MỚI
    └── email-digest.template.ts      ← TẠO MỚI
```

---

## Spec chi tiết

### Queue 1: `email.immediate`
```typescript
// Trigger events: REQUEST_ASSIGNED, REQUEST_MENTIONED, SLA_NEAR_BREACH_*
// Logic: nhận job → gửi email ngay, không buffer

new Worker(QUEUE_NAMES.EMAIL_IMMEDIATE, async (job) => {
  const { to, eventType, payload } = job.data;

  const subject = buildSubject(eventType, payload);
  const html    = buildImmediateHtml(eventType, payload);

  await mailService.send({ to, subject, html });
}, { connection: redisConfig });
```

### Queue 2: `email.digest`
```typescript
// Trigger events: REQUEST_CREATED, REQUEST_STATUS_CHANGED, REQUEST_COMMENTED
// Logic: buffer theo (userId, requestId) trong Redis với TTL 5 phút
//        Sau 5 phút → gom tất cả events → 1 email

new Worker(QUEUE_NAMES.EMAIL_DIGEST, async (job) => {
  const { userId, requestId, tenantId, eventType, payload } = job.data;

  const bufferKey = `digest:${tenantId}:${userId}:${requestId}`;
  const existing  = await redis.get(bufferKey);
  const events    = existing ? JSON.parse(existing) : [];

  events.push({ eventType, payload, at: new Date().toISOString() });

  if (events.length === 1) {
    // First event → set TTL 5 phút, schedule digest send
    await redis.set(bufferKey, JSON.stringify(events), 'EX', 300);
    await digestQueue.add(
      'send-digest',
      { userId, requestId, tenantId, bufferKey },
      { delay: 300_000, jobId: `digest-${bufferKey}` }  // jobId để dedup
    );
  } else {
    // Subsequent events → chỉ update buffer, KHÔNG schedule lại
    await redis.set(bufferKey, JSON.stringify(events), 'KEEPTTL');
  }
}, { connection: redisConfig });

// Digest sender — chạy sau 5 phút
new Worker('digest-sender', async (job) => {
  const { userId, requestId, tenantId, bufferKey } = job.data;

  const raw    = await redis.get(bufferKey);
  if (!raw) return;  // đã được xử lý rồi

  const events = JSON.parse(raw);
  const user   = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.email) return;

  const html = buildDigestHtml(events, requestId, tenantId);
  await mailService.send({
    to:      user.email,
    subject: `[SupportOps] ${events.length} updates on request`,
    html,
  });

  await redis.del(bufferKey);
}, { connection: redisConfig });
```

### Rate limiting
```typescript
// Trước khi gửi bất kỳ email nào:
const rateKey   = `email-rate:${userId}:${requestId}`;
const sentCount = Number(await redis.get(rateKey) ?? 0);
if (sentCount >= 5) return;  // max 5 emails/user/request/giờ

await redis.incr(rateKey);
await redis.expire(rateKey, 3600);
```

### Email provider
```typescript
// Dùng config từ apps/api/src/config/mail.config.ts
// ⚠️ Kiểm tra mail provider hiện tại (nodemailer / sendgrid / resend)
//    Nếu worker không share module với api → copy config hoặc tạo
//    apps/worker/src/mail.service.ts riêng
```

---

## ⚠️ GATE — Worker Phase
```bash
# Start worker → không crash
pnpm --filter @supportops/worker start
# Log: "Workers connected to Redis"
# Log: "SLA monitor scheduled: every 60s"
# Log: "Email workers ready: [email-immediate, email-digest]"
```

## Test cases bắt buộc
```text
✓ email.immediate: gửi email ngay khi nhận job
✓ email.digest: buffer events trong 5 phút
✓ email.digest: chỉ gửi 1 email sau 5 phút (không gửi 3 email riêng)
✓ Rate limit: event thứ 6 trong 1 giờ bị skip
✓ Rate limit: không ảnh hưởng giữa các requestId khác nhau
✓ digest: redis key bị xóa sau khi gửi
```

## Quality gate
```bash
pnpm --filter @supportops/worker test email-dispatch
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ — Ghi rõ `worker start PASS`
Task tiếp theo: **TASK-501**
