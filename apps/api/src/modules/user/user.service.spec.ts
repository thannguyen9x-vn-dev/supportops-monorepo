import { UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthMailService } from '../auth/auth-mail.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: any;
  let storage: any;
  let authMail: any;
  let config: any;

  const now = new Date('2026-01-01T00:00:00.000Z');
  const baseUser = {
    id: 'u1', tenantId: 't1', email: 'user@example.com', avatarUrl: null,
    firstName: 'Jane', lastName: 'Doe', fullName: 'Jane Doe', phone: null, birthday: null,
    address: null, city: null, zipCode: null, country: null, organization: null, department: null,
    timezone: 'UTC', locale: 'en', isActive: true, lastLoginAt: null,
    role: 'MEMBER', status: 'ACTIVE', passwordHash: 'hashed', isEmailVerified: true, emailVerifiedAt: now,
    createdAt: now, updatedAt: now,
  };

  beforeEach(() => {
    prisma = {
      user: { findFirst: jest.fn(), update: jest.fn(), findMany: jest.fn() },
      membership: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
      userPreference: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      refreshSession: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
      refreshToken: { updateMany: jest.fn() },
      invite: { create: jest.fn() },
      auditLog: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation((arg: unknown) => {
      if (typeof arg === 'function') {
        return arg(prisma);
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    storage = {
      uploadPublicObject: jest.fn(),
      deleteObjectByUrl: jest.fn(),
    };

    authMail = {
      sendInviteEmail: jest.fn(),
    };

    config = {
      get: jest.fn((key: string, fallback?: unknown) => {
        if (key === 'auth.webAppBaseUrl') return 'http://localhost:3000';
        return fallback;
      }),
    };

    service = new UserService(
      prisma as unknown as PrismaService,
      storage as unknown as ObjectStorageService,
      authMail as unknown as AuthMailService,
      config as unknown as ConfigService,
    );
  });

  it('getMe returns current user profile', async () => {
    prisma.user.findFirst.mockResolvedValue(baseUser);
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'EMPLOYEE', joinedAt: now });

    const result = await service.getMe('t1', 'u1');

    expect(result.id).toBe('u1');
    expect(result.role).toBe('EMPLOYEE');
  });

  it('getMe throws not found for missing user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.getMe('t1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('changePassword throws when current password is incorrect', async () => {
    prisma.user.findFirst.mockResolvedValue(baseUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.changePassword('t1', 'u1', { currentPassword: 'wrong', newPassword: 'new12345', confirmPassword: 'new12345' }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('uploadAvatar uploads new avatar and stores url', async () => {
    prisma.user.findFirst.mockResolvedValue(baseUser);
    storage.uploadPublicObject.mockResolvedValue('http://cdn/avatar.png');

    const result = await service.uploadAvatar('t1', 'u1', {
      originalname: 'avatar.png',
      mimetype: 'image/png',
      size: 200,
      buffer: Buffer.from('abc'),
    } as any);

    expect(storage.uploadPublicObject).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { avatarUrl: 'http://cdn/avatar.png' } });
    expect(result.url).toBe('http://cdn/avatar.png');
  });

  it('uploadAvatar rejects unsupported mime type', async () => {
    await expect(
      service.uploadAvatar('t1', 'u1', {
        originalname: 'avatar.gif',
        mimetype: 'image/gif',
        size: 200,
        buffer: Buffer.from('abc'),
      } as any),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});
