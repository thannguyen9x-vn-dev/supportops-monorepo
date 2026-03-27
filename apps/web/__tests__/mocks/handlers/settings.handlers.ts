import { http, HttpResponse } from "msw";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

const profile = {
  id: "user-1",
  email: "admin@supportops.dev",
  firstName: "SupportOps",
  lastName: "Admin",
  role: "TENANT_ADMIN",
  tenantId: "tenant-1",
  tenantName: "SupportOps",
};

export const settingsHandlers = [
  http.get(`${BASE}/users/me`, () => HttpResponse.json({ data: profile })),
  http.put(`${BASE}/users/me`, async ({ request }) => {
    const payload = await request.json();
    return HttpResponse.json({ data: { ...profile, ...(payload as object) } });
  }),
  http.post(`${BASE}/users/me/avatar`, () => HttpResponse.json({ data: { url: "https://cdn.example.com/avatar.png" } })),
  http.put(`${BASE}/users/me/password`, () => HttpResponse.json({ data: null })),
  http.get(`${BASE}/users/me/preferences`, () =>
    HttpResponse.json({
      data: {
        language: "en",
        timezone: "UTC",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "24h",
        emailNotifications: true,
      },
    }),
  ),
  http.put(`${BASE}/users/me/preferences`, async ({ request }) =>
    HttpResponse.json({ data: await request.json() }),
  ),
  http.get(`${BASE}/users/me/sessions`, () =>
    HttpResponse.json({
      data: [
        {
          id: "session-1",
          ipAddress: "127.0.0.1",
          userAgent: "Chrome",
          lastUsedAt: "2026-03-01T00:00:00.000Z",
        },
      ],
    }),
  ),
  http.delete(`${BASE}/users/me/sessions/:id`, () => HttpResponse.json({ data: null })),
];
