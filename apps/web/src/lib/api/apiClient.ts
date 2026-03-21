import type { ApiErrorDetail, ApiResponse } from "@supportops/types";

import { tokenManager } from "@/lib/auth/tokenManager";
import { env } from "@/lib/config/env";

export class ApiError extends Error {
  public status: number;
  public error: ApiErrorDetail;

  constructor(status: number, error: ApiErrorDetail) {
    super(error.message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
  }

  get code() {
    return this.error.code;
  }

  get traceId() {
    return this.error.traceId;
  }
}

interface RequestConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  timeout?: number;
}

type RequestConfigWithBody = RequestConfig & {
  body?: unknown;
};

class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, defaultTimeout = 30_000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    config: RequestConfigWithBody = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithAuthRetry(method, endpoint, config);

      if (response.status === 204) {
        return { data: null as T };
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return { data: null as T };
      }

      const rawBody = await response.text();
      if (!rawBody.trim()) {
        return { data: null as T };
      }

      return JSON.parse(rawBody) as ApiResponse<T>;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError(408, {
          code: "REQUEST_TIMEOUT",
          message: "Request timed out"
        });
      }

      throw new ApiError(0, {
        code: "NETWORK_ERROR",
        message: "Network error — please check your connection"
      });
    }
  }

  private async fetchWithAuthRetry(
    method: string,
    endpoint: string,
    config: RequestConfigWithBody = {}
  ): Promise<Response> {
    const {
      params,
      skipAuth = false,
      timeout = this.defaultTimeout,
      body,
      headers: customHeaders,
      ...fetchConfig
    } = config;

    const url = new URL(`${this.baseUrl}${endpoint}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers = new Headers(customHeaders);
    headers.set("x-trace-id", crypto.randomUUID());

    if (body && !(body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    } else if (body instanceof FormData) {
      // Let the browser generate multipart boundary automatically.
      headers.delete("Content-Type");
    }

    if (!skipAuth) {
      const token = tokenManager.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    let requestBody: BodyInit | undefined;
    if (body instanceof FormData) {
      requestBody = body;
    } else if (body !== undefined) {
      requestBody = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), {
        ...fetchConfig,
        method,
        headers,
        body: requestBody,
        signal: controller.signal,
        credentials: "include"
      });

      if (response.status === 401 && !skipAuth) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          return this.fetchWithAuthRetry(method, endpoint, {
            ...config,
            skipAuth: false
          });
        }

        tokenManager.clear();
        if (typeof window !== "undefined") {
          const loginPath = this.getLoginRedirectPath(window.location.pathname);
          if (loginPath && window.location.pathname !== loginPath) {
            window.location.replace(loginPath);
          }
        }
      }

      if (!response.ok) {
        let errorDetail: ApiErrorDetail;
        try {
          const errorBody = (await response.json()) as { error?: ApiErrorDetail };
          errorDetail =
            errorBody.error || {
              code: "UNKNOWN_ERROR",
              message: `HTTP ${response.status}: ${response.statusText}`
            };
        } catch {
          errorDetail = {
            code: "UNKNOWN_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`
          };
        }
        throw new ApiError(response.status, errorDetail);
      }

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private getLoginRedirectPath(pathname: string): string | null {
    const publicPaths = ["/", "/login", "/register", "/verify-email", "/forgot-password", "/pricing", "/reset-password", "/auth-support", "/invite/accept"];
    const localeMatch = pathname.match(/^\/(en|vi)(?=\/|$)/);
    const locale = localeMatch?.[1] ?? "en";
    const pathWithoutLocale = pathname.replace(/^\/(en|vi)(?=\/|$)/, "") || "/";
    const isPublicRoute = publicPaths.some(
      (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
    );

    if (isPublicRoute) {
      return null;
    }

    return `/${locale}/login`;
  }

  private async tryRefreshToken(): Promise<boolean> {
    try {
      // Primary path: HttpOnly refresh cookie (preferred).
      let response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include"
      });

      // Backward-compatible fallback for existing legacy sessions.
      if (!response.ok) {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          return false;
        }

        response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          credentials: "include"
        });
      }

      if (!response.ok) {
        return false;
      }

      const payload = (await response.json()) as { data?: { accessToken?: string } };
      if (!payload.data?.accessToken) {
        return false;
      }

      tokenManager.setAccessToken(payload.data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>("GET", endpoint, config);
  }

  post<T>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>("POST", endpoint, { ...config, body });
  }

  put<T>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>("PUT", endpoint, { ...config, body });
  }

  patch<T>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>("PATCH", endpoint, { ...config, body });
  }

  delete<T>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>("DELETE", endpoint, { ...config, body });
  }

  upload<T>(endpoint: string, formData: FormData, config?: RequestConfig) {
    return this.request<T>("POST", endpoint, { ...config, body: formData });
  }

  async download(endpoint: string, config?: RequestConfig): Promise<Blob> {
    const response = await this.fetchWithAuthRetry("GET", endpoint, config);
    return response.blob();
  }
}

export const apiClient = new HttpClient(env.NEXT_PUBLIC_API_BASE_URL);
