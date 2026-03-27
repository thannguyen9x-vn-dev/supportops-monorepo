import { AssetController } from './asset.controller';

describe('AssetController', () => {
  const service = {
    listAssetTypes: jest.fn(),
    createAssetType: jest.fn(),
    updateAssetType: jest.fn(),
    deleteAssetType: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    detail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let controller: AssetController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AssetController(service as any);
  });

  it('delegates asset-type routes to service', async () => {
    service.listAssetTypes.mockResolvedValue([]);
    await controller.listAssetTypes('t1');
    expect(service.listAssetTypes).toHaveBeenCalledWith('t1');

    await controller.createAssetType('t1', { name: 'Laptop' } as any);
    expect(service.createAssetType).toHaveBeenCalledWith('t1', { name: 'Laptop' });
  });

  it('delegates asset CRUD routes to service', async () => {
    service.list.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });

    await controller.list('t1', { page: 1 } as any);
    await controller.detail('t1', 'a1', { page: 1 } as any);
    await controller.delete('t1', 'a1');

    expect(service.list).toHaveBeenCalledWith('t1', { page: 1 });
    expect(service.detail).toHaveBeenCalledWith('t1', 'a1', { page: 1 });
    expect(service.delete).toHaveBeenCalledWith('t1', 'a1');
  });
});
