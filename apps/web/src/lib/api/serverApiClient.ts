import "server-only";

import type { ApiErrorDetail, ApiResponse } from "@supportops/types";
import { cookies, headers } from "next/headers";

import { env } from "@/lib/config/env";

class ServerApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.API_INTERNAL_URL || env.NEXT_PUBLIC_API_BASE_URL;
  }

  get<T>(path: string, options?: { params?: Record<string, unknown>; revalidate?: number }) {
    return this.request<T>("GET", path, { params: options?.params, revalidate: options?.revalidate });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }

  delete<T>(path: string, body?: unknown) {
    return this.request<T>("DELETE", path, { body });
  }

  private async request<T>(
    method: string,
    path: string,
    options?: { params?: Record<string, unknown>; body?: unknown; revalidate?: number }
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method,
      headers: await this.getHeaders(options?.body),
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      next: options?.revalidate === undefined ? undefined : { revalidate: options.revalidate }
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    if (response.status === 204) {
      return { data: null as T };
    }

    return (await response.json()) as ApiResponse<T>;
  }

  private async getHeaders(body: unknown): Promise<HeadersInit> {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const forwardedAuth = headerStore.get("authorization");
    const accessToken = cookieStore.get("access_token")?.value;

    const headersInit: Record<string, string> = {
      "x-trace-id": headerStore.get("x-trace-id") || crypto.randomUUID()
    };

    if (body !== undefined) {
      headersInit["Content-Type"] = "application/json";
    }

    if (forwardedAuth) {
      headersInit.Authorization = forwardedAuth;
    } else if (accessToken) {
      headersInit.Authorization = `Bearer ${accessToken}`;
    }

    return headersInit;
  }

  private buildUrl(path: string, params?: Record<string, unknown>) {
    const url = new URL(path, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleError(response: Response): Promise<Error> {
    try {
      const body = (await response.json()) as { error?: ApiErrorDetail };
      return new Error(body.error?.message || `HTTP ${response.status}`);
    } catch {
      return new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

export const serverApiClient = new ServerApiClient();
