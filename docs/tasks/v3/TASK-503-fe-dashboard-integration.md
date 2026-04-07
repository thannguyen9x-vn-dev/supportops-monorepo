# TASK-503 — FE: Dashboard Integration (layout + RBAC gate)
> **Phase:** 5 — Frontend | **Prereq:** TASK-501 + TASK-502 done | **Status:** ✅ Done

---

## Mục tiêu

Tích hợp `AiChatPanel` vào dashboard. Chỉ TENANT_ADMIN thấy panel này. Layout thay đổi từ full-width sang 2-column Grid khi TENANT_ADMIN đăng nhập.

---

## Files cần sửa

```text
apps/web/src/features/dashboard/components/DashboardOverview.tsx   ← MODIFIED
```

---

## Spec chi tiết

### Layout thay đổi

**Trước (tất cả role):**
```
┌──────────────────────────────────────┐
│         DashboardContent             │
│         (full width)                 │
└──────────────────────────────────────┘
```

**Sau (TENANT_ADMIN):**
```
┌──────────────────┬───────────────────┐
│  DashboardContent │   AiChatPanel     │
│  (xl: 8 cols)    │   (xl: 4 cols)    │
└──────────────────┴───────────────────┘
```

**Sau (non-TENANT_ADMIN — không đổi):**
```
┌──────────────────────────────────────┐
│         DashboardContent             │
│         (full width)                 │
└──────────────────────────────────────┘
```

### `DashboardOverview.tsx` — logic cần thêm

```typescript
"use client";
// Thêm imports:
import { canUseAiAssistant } from "@/features/ai-assistant/utils/aiAccess";
import { AiChatPanel } from "@/features/ai-assistant/components/AiChatPanel";
import { aiService } from "@/features/ai-assistant/services/ai.service";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_AI_MODEL } from "@supportops/types";

// Trong component:
const { user } = useAuth();
const isAiEnabled = canUseAiAssistant(user?.role);
const [defaultModel, setDefaultModel] = useState(DEFAULT_AI_MODEL);

useEffect(() => {
  if (!isAiEnabled) return;
  aiService.getSettings().then((res) => {
    if (res.data?.defaultModel) setDefaultModel(res.data.defaultModel);
  }).catch(() => {}); // silent fail — fallback to default
}, [isAiEnabled]);

// Render:
if (isAiEnabled) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, xl: 8 }}>
        <DashboardContent />
      </Grid>
      <Grid size={{ xs: 12, xl: 4 }}>
        <AiChatPanel defaultModel={defaultModel} />
      </Grid>
    </Grid>
  );
}

return <DashboardContent />;  // non-TENANT_ADMIN: không thay đổi
```

### RBAC gate — quan trọng

- `canUseAiAssistant(role)` trả về `true` CHỈ khi `role === "TENANT_ADMIN"`
- `AiChatPanel` không render với bất kỳ role nào khác
- Không cần xử lý 403 ở FE — BE đã guard

### Error handling

- `aiService.getSettings()` fail silently → dùng `DEFAULT_AI_MODEL` làm fallback
- Nếu AI Service down → `AiChatPanel` hiển thị error state — dashboard KPI vẫn load bình thường

---

## Quality gate

```bash
pnpm --filter @supportops/web typecheck   # 0 errors
pnpm lint                                  # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ — Implementation V3 COMPLETE
