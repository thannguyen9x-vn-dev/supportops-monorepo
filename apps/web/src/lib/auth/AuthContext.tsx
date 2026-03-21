"use client";

import type { AuthUser, LoginRequest, RegisterRequest } from "@supportops/types";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { ENDPOINTS, apiClient, ApiError } from "@/lib/api";

import { tokenManager } from "./tokenManager";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateUser: (patch: Partial<AuthUser>) => void;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function resolveLocalizedLoginPath(pathname: string): string {
  const localeMatch = pathname.match(/^\/(en|vi)(?=\/|$)/);
  const locale = localeMatch?.[1] ?? "en";
  return `/${locale}/login`;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Always try /users/me on app load.
        // If sessionStorage access token is missing, apiClient will silently refresh
        // via HttpOnly refresh cookie and retry automatically.
        const { data } = await apiClient.get<AuthUser>(ENDPOINTS.USERS.ME);
        setUser(data);
      } catch (error) {
        // Clear only when auth is invalid; keep behavior stable for other transient errors.
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          tokenManager.clear();
        }
        setUser(null);
      }
      setIsLoading(false);
    };

    void init();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { data } = await apiClient.post<{
      accessToken: string;
      refreshToken?: string;
      user: AuthUser;
    }>(ENDPOINTS.AUTH.LOGIN, credentials, { skipAuth: true });

    tokenManager.setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    await apiClient.post<{
      message: string;
      requiresEmailVerification: boolean;
      email: string;
    }>(ENDPOINTS.AUTH.REGISTER, payload, { skipAuth: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT, undefined, { timeout: 5_000 });
    } catch {
      // Ignore network/logout API failures and continue local sign-out.
    } finally {
      tokenManager.clear();
      setUser(null);

      if (typeof window !== "undefined") {
        window.location.replace(resolveLocalizedLoginPath(window.location.pathname));
      }
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      updateUser,
      login,
      register,
      logout
    }),
    [isLoading, login, logout, register, updateUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
