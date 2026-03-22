import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { AuthProvider, useAuth } from "./AuthContext";

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockClear = jest.fn();
const mockSetAccessToken = jest.fn();

jest.mock("@/lib/api", () => ({
  ENDPOINTS: {
    USERS: { ME: "/users/me" },
    AUTH: { LOGIN: "/auth/login", REGISTER: "/auth/register", LOGOUT: "/auth/logout" }
  },
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args)
  },
  ApiError: class extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
}));

jest.mock("./tokenManager", () => ({
  tokenManager: {
    clear: () => mockClear(),
    setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args)
  }
}));

describe("AuthContext logout", () => {
  const mockUser = {
    id: "u-1",
    email: "user@example.com",
    firstName: "Support",
    lastName: "Ops",
    avatarUrl: null,
    role: "TENANT_ADMIN",
    tenantId: "t-1",
    tenantName: "Tenant",
    joinedAt: null,
  };

  function wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  const originalLocation = window.location;
  let replaceSpy: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockUser });
    mockPost.mockResolvedValue({ data: null });

    replaceSpy = jest.fn();
    delete (window as Partial<Window>).location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        pathname: "/vi/dashboard",
        replace: replaceSpy
      }
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation
    });
  });

  it("waits for logout API before clearing local auth state", async () => {
    let resolveLogout: (() => void) | undefined;
    mockPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogout = () => resolve({ data: null });
        })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let pendingLogout!: Promise<void>;
    act(() => {
      pendingLogout = result.current.logout();
    });

    expect(mockPost).toHaveBeenCalledWith("/auth/logout", undefined, { timeout: 5000 });
    expect(mockClear).not.toHaveBeenCalled();

    await act(async () => {
      resolveLogout?.();
      await pendingLogout;
    });

    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it("redirects to localized login path after logout", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(replaceSpy).toHaveBeenCalledWith("/vi/login");
  });
});
