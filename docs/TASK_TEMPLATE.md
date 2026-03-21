# Task Template

Copy file này, điền vào, rồi đưa cho AI (Claude Code / Codex) để làm đúng ngay từ đầu.

---

## 1. Mô tả task

> Một câu tóm tắt rõ mục tiêu. Tránh dùng từ mơ hồ như "làm đẹp hơn" hay "fix lại".

**Ví dụ:**
> Tạo `PhoneNumberField` là shared component trong `@supportops/ui-form`, dùng ở Settings và bất kỳ form nào cần nhập số điện thoại quốc tế.

---

## 2. Scope

> Liệt kê rõ package/module nào bị ảnh hưởng. Nếu không chắc thì ghi "cần xác định".

| Layer | Package/Module | Ghi chú |
|---|---|---|
| Shared UI | `packages/ui/form` | Tạo component mới |
| Contracts | `packages/types` | Thêm/sửa schema nếu cần |
| Frontend | `apps/web` — module `settings` | Dùng component mới |
| Backend | `apps/api` — module `user` | Thêm validation nếu cần |

**Out of scope (không làm):**
- [ ] ...

---

## 3. UI / Layout

> Mô tả cấu trúc giao diện. Đính kèm Figma link hoặc screenshot nếu có.

**Figma / Screenshot:** _(link hoặc ảnh đính kèm)_

**Layout:**
```
[ Country selector | 128px ] [ Phone input | fill remaining ]
```

**Responsive:**
- [ ] Luôn giữ 1 hàng, không wrap ở mọi screen size
- [ ] _(hoặc) Tách 2 hàng khi màn hình < 480px_

**Trạng thái component:**
| Trạng thái | Mô tả |
|---|---|
| Default | ... |
| Focus | ... |
| Error | ... |
| Disabled | ... |

---

## 4. Behavior

> Mô tả hành vi tương tác cụ thể.

- [ ] Search hoạt động theo: tên quốc gia / mã quốc gia / cả hai
- [ ] Popup align: trái / phải / auto
- [ ] Popup width: `340px` cố định / tự co giãn
- [ ] Khi chọn country: giữ số đã nhập / clear input
- [ ] _(thêm behavior khác nếu có)_

---

## 5. Validation

> Điền cả FE lẫn BE nếu cần validate ở cả hai phía.

**Frontend:**
| Field | Rule | Thông báo lỗi |
|---|---|---|
| Phone | Hợp lệ theo country đã chọn (libphonenumber-js) | `invalidPhoneNumber` |
| Phone | Cho phép để trống (optional) | — |

**Hiển thị lỗi:**
- [ ] Lỗi hiện bên ngoài input (helper text)
- [ ] Input không đổi trạng thái khi có lỗi (không viền đỏ)
- [ ] _(hoặc) Input đổi sang trạng thái error bình thường_

**Backend:**
| Field | Rule | HTTP Status |
|---|---|---|
| phone | Định dạng quốc tế E.164 hoặc để trống | 400 |

---

## 6. API / Contracts

> Điền nếu task này cần thêm/sửa endpoint hoặc schema.

- [ ] Không cần thay đổi API
- [ ] Sửa schema: `packages/types/src/schemas/______.ts`
- [ ] Thêm endpoint mới: `______ [METHOD] /api/v1/______`
- [ ] Thêm/sửa DTO backend: `______Request.java` / `______Response.java`

**Lưu ý:** Cập nhật `packages/types` TRƯỚC, FE và BE follow theo.

---

## 7. Shared Component

> Điền nếu task tạo hoặc sửa component dùng chung.

- [ ] Là component mới trong `packages/ui/form` (không custom riêng tại page)
- [ ] Export từ `field/index.ts`
- [ ] Props cần có: `name`, `control`, `label`, `countryOptions`, `...`
- [ ] Props optional: `popupWidthPx`, `disabled`, `...`
- [ ] Không import bất kỳ thứ gì từ `apps/web` (không tạo circular dependency)

---

## 8. i18n

- [ ] Không cần thêm message mới
- [ ] Thêm key mới vào `en.json` và `vi.json`:

```json
{
  "keyName": "English text"
}
```

---

## 9. Acceptance Criteria

> Checklist để AI tự verify trước khi báo xong.

**Chức năng:**
- [ ] ...
- [ ] ...

**UI:**
- [ ] Đúng layout như mô tả ở mục 3
- [ ] Không bị vỡ layout khi thu nhỏ màn hình
- [ ] Đúng behavior theo mục 4

**Validation:**
- [ ] FE validate đúng các rule ở mục 5
- [ ] BE trả về 400 khi sai format

**Code quality:**
- [ ] `pnpm --filter @supportops/ui-form typecheck` pass
- [ ] `pnpm --filter @supportops/types typecheck` pass
- [ ] `pnpm --filter web typecheck` pass
- [ ] Không có `any` type mới
- [ ] Không còn code custom phone riêng tại page (nếu đây là task shared component)

---

## 10. Ghi chú thêm

> Bất cứ thứ gì không nằm trong các mục trên: ràng buộc kỹ thuật, dependency, rủi ro, quyết định thiết kế đã chốt...

- ...
