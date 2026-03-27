import { http, HttpResponse } from "msw";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export const dashboardHandlers = [
  http.get(`${BASE}/dashboard/summary`, () =>
    HttpResponse.json({
      data: {
        scope: "PERSONAL",
        kpis: {
          openRequests: 7,
          unassigned: 2,
          slaBreached: 1,
          resolvedToday: 3,
          avgResolutionTimeHours: 4.5,
          myAssigned: 5,
        },
        requestsByStatus: [],
        requestsByPriority: [],
        slaOverview: {
          onTrack: 5,
          atRisk: 1,
          breached: 1,
        },
      },
    }),
  ),
  http.get(`${BASE}/dashboard/recent-activity`, () =>
    HttpResponse.json({
      data: [
        {
          id: "activity-1",
          requestId: "req-1",
          requestCode: "REQ-001",
          title: "Printer issue",
          action: "STATUS_CHANGED",
          actorName: "SupportOps Admin",
          createdAt: "2026-03-01T10:00:00.000Z",
        },
      ],
    }),
  ),
  http.get(`${BASE}/dashboard/request-trend`, () =>
    HttpResponse.json({
      data: [
        { date: "2026-03-01", submitted: 2, resolved: 1 },
        { date: "2026-03-02", submitted: 3, resolved: 2 },
      ],
    }),
  ),
  http.get(`${BASE}/dashboard/sales-summary`, ({ request }) => {
    const period = new URL(request.url).searchParams.get("period") || "day";

    return HttpResponse.json({
      data: {
        period,
        dataPoints: [
          { label: "A", templates: 10, invoicing: 20 },
          { label: "B", templates: 15, invoicing: 30 },
        ],
      },
    });
  }),
  http.get(`${BASE}/dashboard/kpi`, () => HttpResponse.json({ data: { revenue: 1000, growth: 10 } })),
  http.get(`${BASE}/dashboard/sessions-by-country`, () =>
    HttpResponse.json({ data: [{ country: "US", value: 40 }] }),
  ),
  http.get(`${BASE}/dashboard/sessions-by-device`, () =>
    HttpResponse.json({ data: [{ device: "Desktop", value: 60 }] }),
  ),
  http.get(`${BASE}/dashboard/latest-customers`, ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get("limit") || "6");
    const list = Array.from({ length: limit }, (_, index) => ({
      id: `customer-${index + 1}`,
      name: `Customer ${index + 1}`,
      email: `customer${index + 1}@example.com`,
      country: "US",
      totalSpent: 100 + index,
    }));

    return HttpResponse.json({ data: list });
  }),
  http.get(`${BASE}/dashboard/transactions`, () =>
    HttpResponse.json({
      data: [
        {
          id: "txn-1",
          description: "Template subscription",
          amount: 100,
          status: "COMPLETED",
          dateTime: "2026-03-01T00:00:00.000Z",
        },
      ],
    }),
  ),
];
