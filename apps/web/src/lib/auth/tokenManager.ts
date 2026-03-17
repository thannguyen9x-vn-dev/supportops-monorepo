import { env } from "@/lib/config/env";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] ?? "");
}

class TokenManager {
  private accessToken: string | null = null;

  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken;
    }

    return null;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    // Legacy fallback only: old sessions may still have refresh token in storage/cookie.
    return localStorage.getItem(env.REFRESH_TOKEN_KEY) ?? getCookieValue(env.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(_token: string): void {
    // Intentionally no-op.
    // Refresh token must be stored as HttpOnly cookie by backend/BFF, not accessible from JS.
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  clear(): void {
    this.accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(env.REFRESH_TOKEN_KEY);
      document.cookie = `${env.REFRESH_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
      document.cookie = `refresh_token=; Path=/; Max-Age=0; SameSite=Lax`;
    }
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }
}

export const tokenManager = new TokenManager();
