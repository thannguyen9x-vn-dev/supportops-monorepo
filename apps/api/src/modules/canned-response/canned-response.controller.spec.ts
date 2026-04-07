import { CannedResponseController } from './canned-response.controller';

describe('CannedResponseController', () => {
  const service = {
    findAll: jest.fn(),
    create: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let controller: CannedResponseController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CannedResponseController(service as any);
  });

  it('delegates read endpoints', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });
    service.search.mockResolvedValue([]);

    await controller.list('t1', 'u1', 1, 20, 'reset');
    await controller.search('t1', 'u1', 'reset');

    expect(service.findAll).toHaveBeenCalledWith('t1', 'u1', { page: 1, size: 20, q: 'reset' });
    expect(service.search).toHaveBeenCalledWith('t1', 'u1', 'reset');
  });

  it('delegates write endpoints', async () => {
    service.create.mockResolvedValue({ id: 'c1' });
    service.update.mockResolvedValue({ id: 'c1' });
    service.delete.mockResolvedValue({ id: 'c1' });

    await controller.create('t1', 'u1', { title: 'A', body: 'B' } as any);
    await controller.update('t1', 'u1', 'c1', { title: 'Updated' } as any);
    await controller.delete('t1', 'u1', 'c1');

    expect(service.create).toHaveBeenCalledWith('t1', 'u1', { title: 'A', body: 'B' });
    expect(service.update).toHaveBeenCalledWith('t1', 'u1', 'c1', { title: 'Updated' });
    expect(service.delete).toHaveBeenCalledWith('t1', 'u1', 'c1');
  });
});
