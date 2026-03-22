# Agent Onboarding Prompt

Paste prompt này ở đầu mỗi cuộc hội thoại mới với agent (Claude Code, Codex, hoặc bất kỳ AI nào) trước khi giao task.

---

## PROMPT (copy toàn bộ từ đây)

```
Trước khi làm bất kỳ việc gì, hãy đọc các file sau theo thứ tự để nắm tình hình dự án:

1. docs/AGENT_TASKS.md        — Roadmap đầy đủ: domain map, trạng thái từng module, 4 giai đoạn, quy tắc bắt buộc
2. AGENTS.md (root)           — Coding conventions, forbidden actions, source of truth map
3. apps/web/AGENTS.md         — Frontend-specific rules
4. apps/api/AGENTS.md         — Backend-specific rules

Sau khi đọc xong, báo lại cho tôi:
- Module nào đã Done / In Progress / TODO
- Giai đoạn hiện tại đang ở đâu (Phase 1 / 2 / 3 / 4)
- Có bất kỳ ràng buộc nào liên quan đến task tôi sắp giao không

Sau đó tôi sẽ giao task cụ thể.
```

---

## Khi giao task cụ thể, thêm vào cuối

```
Task: [mô tả ngắn gọn]

Trước khi code, hãy:
1. Xác nhận task này thuộc giai đoạn nào trong AGENT_TASKS.md
2. Liệt kê acceptance criteria liên quan
3. Xác nhận package/module nào bị ảnh hưởng
4. Chạy pnpm typecheck + pnpm lint sau khi xong
```

---

## Template nhanh (1 dòng khi bạn đã quen)

```
Đọc docs/AGENT_TASKS.md + AGENTS.md trước, sau đó: [task của bạn]
```

---

## Ghi chú

- `docs/AGENT_TASKS.md` là source of truth cho roadmap — cập nhật file này khi task hoàn thành.
- Nếu agent làm gì sai, kiểm tra lại Phần G (Quy tắc cho Agent) trong `AGENT_TASKS.md`.
- Checklist trạng thái nằm ở Phần H — cập nhật `⬜` → `✅` sau mỗi task xong.
