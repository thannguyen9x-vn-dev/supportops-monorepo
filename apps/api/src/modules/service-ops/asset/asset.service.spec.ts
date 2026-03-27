import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssetService } from './asset.service';

describe('AssetService', () => {
  let service: AssetService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      assetType: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      asset: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      serviceRequest: { findMany: jest.fn(), count: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));

    service = new AssetService(prisma as unknown as PrismaService);
  });

  it('listAssetTypes returns sorted mapped items', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prisma.assetType.findMany.mockResolvedValue([
      { id: 'at1', tenantId: 't1', name: 'Laptop', category: null, description: null, createdAt: now, updatedAt: now },
    ]);

    const result = await service.listAssetTypes('t1');

    expect(prisma.assetType.findMany).toHaveBeenCalledWith({ where: { tenantId: 't1' }, orderBy: { name: 'asc' } });
    expect(result[0]?.id).toBe('at1');
  });

  it('createAssetType throws conflict for duplicate name', async () => {
    prisma.assetType.findFirst.mockResolvedValue({ id: 'dup' });

    await expect(service.createAssetType('t1', { name: 'Laptop' } as any)).rejects.toThrow(ConflictException);
  });

  it('create creates asset with normalized assetCode', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prisma.assetType.findFirst.mockResolvedValue({ id: 'at1' });
    prisma.asset.findFirst.mockResolvedValue(null);
    prisma.asset.create.mockResolvedValue({
      id: 'a1', tenantId: 't1', assetCode: 'ASSET-001', name: 'Laptop', assetTypeId: 'at1', locationId: 'loc1',
      status: 'ACTIVE', serialNumber: null, model: null, assignedDepartment: null, responsibleTeam: null,
      installedAt: null, description: null, createdAt: now, updatedAt: now,
      assetType: { id: 'at1', tenantId: 't1', name: 'Device', category: null, description: null, createdAt: now, updatedAt: now },
    });

    const result = await service.create('t1', {
      assetCode: 'asset-001',
      name: 'Laptop',
      assetTypeId: 'at1',
      locationId: 'loc1',
    } as any);

    expect(prisma.asset.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ assetCode: 'ASSET-001' }) }));
    expect(result.assetCode).toBe('ASSET-001');
  });

  it('detail throws not found when asset does not exist', async () => {
    prisma.asset.findFirst.mockResolvedValue(null);

    await expect(service.detail('t1', 'a1', { page: 1, size: 20 } as any)).rejects.toThrow(NotFoundException);
  });

  it('delete throws not found when asset is missing', async () => {
    prisma.asset.findFirst.mockResolvedValue(null);

    await expect(service.delete('t1', 'a1')).rejects.toThrow(NotFoundException);
  });
});
