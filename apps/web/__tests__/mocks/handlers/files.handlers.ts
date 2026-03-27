import { http, HttpResponse } from "msw";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

export const filesHandlers = [
  http.post(`${BASE}/files/upload`, () =>
    HttpResponse.json({
      data: {
        files: [
          {
            id: "file-1",
            fileName: "report.pdf",
            originalName: "report.pdf",
            mimeType: "application/pdf",
            size: 1200,
            url: "https://cdn.example.com/file-1",
          },
        ],
      },
    }),
  ),
  http.delete(`${BASE}/files/:id`, () => HttpResponse.json({ data: null })),
  http.get(`${BASE}/files/access-url`, ({ request }) => {
    const url = new URL(request.url).searchParams.get("url") || "";
    return HttpResponse.json({
      data: {
        url: `${url}?signed=true`,
        expiresAt: "2026-03-27T00:00:00.000Z",
      },
    });
  }),
];
