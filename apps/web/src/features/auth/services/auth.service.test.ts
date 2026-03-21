import { authService } from "./auth.service";
import { apiClient } from "@/lib/api";

jest.mock("@/lib/api", () => {
  const ENDPOINTS = {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      VERIFY_EMAIL: "/auth/verify-email",
      RESEND_VERIFICATION_EMAIL: "/auth/resend-verification-email",
      REFRESH: "/auth/refresh",
      LOGOUT: "/auth/logout",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password"
    }
  } as const;

  return {
    ENDPOINTS,
    apiClient: {
      post: jest.fn()
    }
  };
});

describe("authService", () => {
  const mockPost = apiClient.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: {} });
  });

  it("calls login endpoint with skipAuth", async () => {
    await authService.login({ email: "user@example.com", password: "Secret123!" });

    expect(mockPost).toHaveBeenCalledWith("/auth/login", { email: "user@example.com", password: "Secret123!" }, { skipAuth: true });
  });

  it("calls forgot-password endpoint with skipAuth", async () => {
    await authService.forgotPassword({ email: "user@example.com" });

    expect(mockPost).toHaveBeenCalledWith("/auth/forgot-password", { email: "user@example.com" }, { skipAuth: true });
  });

  it("calls reset-password endpoint with skipAuth", async () => {
    await authService.resetPassword({
      email: "user@example.com",
      code: "123456",
      newPassword: "NewSecret123!",
      confirmPassword: "NewSecret123!"
    });

    expect(mockPost).toHaveBeenCalledWith(
      "/auth/reset-password",
      {
        email: "user@example.com",
        code: "123456",
        newPassword: "NewSecret123!",
        confirmPassword: "NewSecret123!"
      },
      { skipAuth: true }
    );
  });

  it("calls logout endpoint with auth flow", async () => {
    await authService.logout();

    expect(mockPost).toHaveBeenCalledWith("/auth/logout");
  });
});
