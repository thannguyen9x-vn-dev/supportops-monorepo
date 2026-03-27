import { PayloadTooLargeException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let prisma: any;
  let storage: any;
  let config: any;

  beforeEach(() => {
    prisma = {
      user: { findFirst: jest.fn() },
      uploadedFile: { create: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
    };

    storage = {
      uploadPublicObject: jest.fn(),
      deleteObjectByUrl: jest.fn(),
      createTemporaryReadUrlFromUrl: jest.fn(),
    };

    config = {
      get: jest.fn((key: string, fallback?: unknown) => {
        if (key === 'file.upload.maxFilesPerUpload') return 3;
        if (key === 'file.upload.maxFileSizeBytes') return 100;
        if (key === 'file.upload.allowedMimeTypes') return ['image/png'];
        return fallback;
      }),
    };

    service = new FileService(
      storage as unknown as ObjectStorageService,
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
    );
  });

  it('uploadFiles uploads and stores file metadata', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
    storage.uploadPublicObject.mockResolvedValue('http://files/x.png');
    prisma.uploadedFile.create.mockResolvedValue({
      id: 'f1',
      fileName: 'x.png',
      fileUrl: 'http://files/x.png',
      mimeType: 'image/png',
      sizeBytes: 10,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.uploadFiles('t1', 'u1', [
      { originalname: 'x.png', mimetype: 'image/png', size: 10, buffer: Buffer.from('a') },
    ] as any);

    expect(storage.uploadPublicObject).toHaveBeenCalledTimes(1);
    expect(prisma.uploadedFile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1', uploadedById: 'u1' }) }),
    );
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.id).toBe('f1');
  });

  it('uploadFiles throws when uploader is inactive', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.uploadFiles('t1', 'u1', [{ originalname: 'x.png', mimetype: 'image/png', size: 10, buffer: Buffer.from('a') }] as any),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('uploadFiles throws payload too large when file exceeds size limit', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1' });

    await expect(
      service.uploadFiles('t1', 'u1', [{ originalname: 'big.png', mimetype: 'image/png', size: 101, buffer: Buffer.from('a') }] as any),
    ).rejects.toThrow(PayloadTooLargeException);
  });

  it('uploadFiles maps P2003 to unprocessable error', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
    storage.uploadPublicObject.mockResolvedValue('http://files/x.png');
    prisma.uploadedFile.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('fk', { code: 'P2003', clientVersion: 'x' }));

    await expect(
      service.uploadFiles('t1', 'u1', [{ originalname: 'x.png', mimetype: 'image/png', size: 10, buffer: Buffer.from('a') }] as any),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('deleteFile deletes from storage and db', async () => {
    prisma.uploadedFile.findFirst.mockResolvedValue({ id: 'f1', fileUrl: 'http://files/x.png' });

    await service.deleteFile('t1', 'f1');

    expect(storage.deleteObjectByUrl).toHaveBeenCalledWith('http://files/x.png');
    expect(prisma.uploadedFile.delete).toHaveBeenCalledWith({ where: { id: 'f1' } });
  });

  it('getAccessUrl validates expires range and signs url', () => {
    storage.createTemporaryReadUrlFromUrl.mockReturnValue('signed-url');

    const result = service.getAccessUrl('http://files/x.png', 300);

    expect(storage.createTemporaryReadUrlFromUrl).toHaveBeenCalledWith('http://files/x.png', 300);
    expect(result.url).toBe('signed-url');

    expect(() => service.getAccessUrl('http://files/x.png', 59)).toThrow(UnprocessableEntityException);
  });
});
