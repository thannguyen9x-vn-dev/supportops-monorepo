import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthMailService } from './auth-mail.service';
import { AuthService } from './auth.service';

describe('AuthModule Integration', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() },
            user: { findFirst: jest.fn().mockResolvedValue({ id: 'u1' }), findMany: jest.fn(), update: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
            emailVerificationToken: { findFirst: jest.fn(), deleteMany: jest.fn(), create: jest.fn(), update: jest.fn() },
            refreshToken: { create: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
            refreshSession: { create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn() },
            membership: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
            passwordResetOtp: { deleteMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
            invite: { findFirst: jest.fn(), update: jest.fn() },
            auditLog: { create: jest.fn() },
            $transaction: jest.fn((arg: unknown) => (typeof arg === 'function' ? (arg as any)({}) : Promise.all(arg as Promise<unknown>[]))),
          },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('access-token'), verifyAsync: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string | number) => {
              if (key === 'auth.webAppBaseUrl') return 'http://localhost:3000';
              return defaultValue;
            }),
          },
        },
        {
          provide: AuthMailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendPasswordResetCodeEmail: jest.fn(),
            sendInviteEmail: jest.fn(),
          },
        },
      ],
    }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('controller.refresh throws missing-token error when no cookie/body token', async () => {
    const controller = moduleRef.get(AuthController);
    await expect(controller.refresh({ headers: {} } as any, {}, { cookie: jest.fn() } as any)).rejects.toThrow('Missing refresh token');
  });
});
