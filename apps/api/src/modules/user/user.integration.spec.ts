import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { AuthMailService } from '../auth/auth-mail.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserModule Integration', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: { findFirst: jest.fn().mockResolvedValue(null), update: jest.fn(), findMany: jest.fn() },
            userPreference: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
            membership: { findFirst: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
            refreshSession: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
            refreshToken: { updateMany: jest.fn() },
            invite: { create: jest.fn() },
            auditLog: { create: jest.fn() },
            $transaction: jest.fn((arg: unknown) => (typeof arg === 'function' ? (arg as any)({}) : Promise.all(arg as Promise<unknown>[]))),
          },
        },
        {
          provide: ObjectStorageService,
          useValue: {
            uploadPublicObject: jest.fn(),
            createTemporaryReadUrlFromUrl: jest.fn(),
            deleteObjectByUrl: jest.fn(),
          },
        },
        {
          provide: AuthMailService,
          useValue: {
            sendInviteEmail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              if (key === 'auth.webAppBaseUrl') return 'http://localhost:3000';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('getMe throws not found when mocked user is absent', async () => {
    const controller = moduleRef.get(UserController);
    await expect(controller.getMe('t1', 'u1')).rejects.toThrow();
  });
});
