import { http, HttpResponse } from "msw";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

const assetTypes = [
  { id: "asset-type-1", name: "Laptop", code: "LAPTOP", isActive: true },
  { id: "asset-type-2", name: "Printer", code: "PRINTER", isActive: true },
];

const assets = [
  {
    id: "asset-1",
    assetCode: "AST-001",
    name: "ThinkPad X1",
    status: "IN_USE",
    locationId: "HQ-1",
    assetTypeId: "asset-type-1",
    assetType: assetTypes[0],
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "asset-2",
    assetCode: "AST-002",
    name: "HP LaserJet",
    status: "AVAILABLE",
    locationId: "HQ-2",
    assetTypeId: "asset-type-2",
    assetType: assetTypes[1],
    updatedAt: "2026-03-02T00:00:00.000Z",
  },
];

export const assetHandlers = [
  http.get(`${BASE}/asset-types`, () => HttpResponse.json({ data: assetTypes })),
  http.post(`${BASE}/asset-types`, async ({ request }) => {
    const payload = await request.json();
    return HttpResponse.json({ data: { id: "asset-type-new", ...(payload as object) } });
  }),
  http.patch(`${BASE}/asset-types/:id`, async ({ params, request }) => {
    const payload = await request.json();
    return HttpResponse.json({ data: { id: params.id, ...(payload as object) } });
  }),
  http.delete(`${BASE}/asset-types/:id`, () => HttpResponse.json({ data: null })),

  http.get(`${BASE}/assets`, ({ request }) => {
    const search = new URL(request.url).searchParams.get("search")?.toLowerCase() ?? "";
    const filtered = search ? assets.filter((item) => item.name.toLowerCase().includes(search)) : assets;

    return HttpResponse.json({
      data: filtered,
      meta: {
        page: 1,
        size: 20,
        total: filtered.length,
        totalPages: 1,
      },
    });
  }),
  http.get(`${BASE}/assets/:id`, ({ params }) => {
    const asset = assets.find((item) => item.id === params.id) ?? assets[0];
    return HttpResponse.json({
      data: {
        ...asset,
        comments: [],
        attachments: [],
      },
    });
  }),
  http.post(`${BASE}/assets`, async ({ request }) => {
    const payload = await request.json();
    return HttpResponse.json({ data: { id: "asset-new", ...(payload as object) } });
  }),
  http.patch(`${BASE}/assets/:id`, async ({ params, request }) => {
    const payload = await request.json();
    return HttpResponse.json({ data: { id: params.id, ...(payload as object) } });
  }),
  http.delete(`${BASE}/assets/:id`, () => HttpResponse.json({ data: null })),
];
