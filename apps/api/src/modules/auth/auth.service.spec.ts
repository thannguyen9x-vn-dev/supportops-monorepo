import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthMailService } from './auth-mail.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let configService: any;
  let mailService: any;

  const now = new Date('2026-01-01T00:00:00.000Z');

  beforeEach(() => {
    prisma = {
      tenant: { findUnique: jest.fn(), create: jest.fn() },
      user: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
      emailVerificationToken: { findFirst: jest.fn(), deleteMany: jest.fn(), create: jest.fn(), update: jest.fn() },
      refreshToken: { create: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      refreshSession: { create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn() },
      membership: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      passwordResetOtp: { deleteMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      invite: { findFirst: jest.fn(), update: jest.fn() },
      auditLog: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation((arg: unknown) => {
      if (typeof arg === 'function') {
        return arg(prisma);
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    jwtService = { signAsync: jest.fn().mockResolvedValue('access-token') };
    configService = {
      get: jest.fn((key: string, fallback?: unknown) => {
        if (key === 'jwt.accessTokenTtlSeconds') return 900;
        if (key === 'jwt.refreshTokenTtlSeconds') return 604800;
        if (key === 'jwt.sessionRefreshTokenTtlSeconds') return 86400;
        if (key === 'auth.webAppBaseUrl') return 'http://localhost:3000';
        if (key === 'auth.emailVerificationTokenTtlSeconds') return 86400;
        return fallback;
      }),
    };
    mailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetCodeEmail: jest.fn(),
      sendInviteEmail: jest.fn(),
    };

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      mailService as unknown as AuthMailService,
    );
  });

  it('register creates tenant and user for new email', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.tenant.create.mockResolvedValue({ id: 't1', name: 'Acme', slug: 'acme' });
    prisma.user.create.mockResolvedValue({
      id: 'u1', tenantId: 't1', email: 'a@example.com', firstName: 'A', lastName: 'B', role: 'MEMBER',
      isActive: true, status: 'ACTIVE', passwordHash: 'hash', isEmailVerified: false, createdAt: now, updatedAt: now,
    });
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
    jest.spyOn(service as any, 'issueEmailVerificationToken').mockResolvedValue(undefined);

    const result = await service.register({
      organizationName: 'Acme', tenantSlug: 'acme', email: 'a@example.com', password: 'secret123', firstName: 'A', lastName: 'B',
    });

    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ email: 'a@example.com' }) }));
    expect(result.requiresEmailVerification).toBe(true);
  });

  it('register throws conflict when email already exists', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({ organizationName: 'Acme', tenantSlug: 'acme', email: 'a@example.com', password: 'secret123' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('login returns tokens for valid credentials', async () => {
    const user = {
      id: 'u1', tenantId: 't1', email: 'a@example.com', firstName: 'A', lastName: 'B', role: 'MEMBER',
      isActive: true, status: 'ACTIVE', passwordHash: 'hash', isEmailVerified: true, createdAt: now, updatedAt: now,
    };
    jest.spyOn(service as any, 'resolveUserForLogin').mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    prisma.user.update.mockResolvedValue({ ...user, lastLoginAt: now });
    prisma.membership.findFirst.mockResolvedValue({ id: 'm1', tenantId: 't1', roleCode: 'EMPLOYEE', joinedAt: now });
    jest.spyOn(service as any, 'issueTokens').mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 900, rememberMe: false, user: { id: 'u1' } });

    const result = await service.login({ email: 'a@example.com', password: 'secret123' } as any);

    expect(result.accessToken).toBe('a');
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'u1' } }));
  });

  it('refresh throws unauthorized when refresh token missing', async () => {
    await expect(service.refresh({ refreshToken: '' })).rejects.toThrow(UnauthorizedException);
  });

  it('resetPassword throws when confirm password mismatch', async () => {
    await expect(
      service.resetPassword({ email: 'a@example.com', code: '12345678', newPassword: 'x', confirmPassword: 'y' }),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});
