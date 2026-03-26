import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080/api/v1";

async function proxyRequest(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/v1", "");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${path}${search}`;

  const headers = new Headers();
  const forwardHeaders = ["authorization", "content-type", "x-trace-id", "accept"];

  forwardHeaders.forEach((headerName) => {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  });

  const fetchOptions: RequestInit = {
    method: request.method,
    headers
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      fetchOptions.body = await request.arrayBuffer();
    } else {
      fetchOptions.body = await request.text();
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, fetchOptions);
    const responseHeaders = new Headers();

    backendResponse.headers.forEach((value, key) => {
      if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "PROXY_ERROR",
          message: "Backend service unavailable"
        }
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
