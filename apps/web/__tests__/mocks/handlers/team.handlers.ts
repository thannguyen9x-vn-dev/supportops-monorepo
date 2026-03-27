import { http, HttpResponse } from "msw";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

const teamUsers = [
  {
    id: "user-1",
    tenantId: "tenant-1",
    email: "admin@supportops.dev",
    fullName: "SupportOps Admin",
    department: "IT",
    userStatus: "ACTIVE",
    isActive: true,
    lastLoginAt: "2026-03-01T10:00:00.000Z",
    membershipId: "membership-1",
    roleCode: "TENANT_ADMIN",
    membershipStatus: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export const teamHandlers = [
  http.get(`${BASE}/users`, () => HttpResponse.json({ data: teamUsers })),
  http.post(`${BASE}/users/invite`, async ({ request }) => {
    const payload = (await request.json()) as { email?: string };
    return HttpResponse.json({
      data: {
        inviteId: `invite-${payload.email ?? "unknown"}`,
        expiresAt: "2026-12-31T00:00:00.000Z",
      },
    });
  }),
  http.patch(`${BASE}/users/:userId/role`, () => HttpResponse.json({ data: null })),
  http.patch(`${BASE}/users/:userId/department`, () => HttpResponse.json({ data: null })),
  http.patch(`${BASE}/users/:userId/deactivate`, () => HttpResponse.json({ data: null })),
  http.patch(`${BASE}/users/:userId/reactivate`, () => HttpResponse.json({ data: null })),
];
