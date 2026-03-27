import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    acceptInvite: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string, fallback?: unknown) => {
      if (key === 'jwt.refreshTokenTtlSeconds') return 604800;
      return fallback;
    }),
  } as unknown as ConfigService;

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService as any, configService);
  });

  it('login delegates to service and sets refresh cookie', async () => {
    authService.login.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', rememberMe: true, expiresIn: 900, user: {} });
    const response = { cookie: jest.fn() };

    const result = await controller.login({ email: 'a@example.com', password: 'x' } as any, response as any);

    expect(authService.login).toHaveBeenCalledWith({ email: 'a@example.com', password: 'x' });
    expect(response.cookie).toHaveBeenCalled();
    expect(result.refreshToken).toBe('r');
  });

  it('refresh throws unauthorized when token is missing in body and cookie', async () => {
    await expect(controller.refresh({ headers: {} } as any, {}, { cookie: jest.fn() } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('verifyEmail returns success message', async () => {
    authService.verifyEmail.mockResolvedValue(undefined);

    const result = await controller.verifyEmail({ token: 'abc' });

    expect(result.message).toContain('Email verified');
  });
});
