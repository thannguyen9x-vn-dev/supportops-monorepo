import { KnowledgeBaseController } from './knowledge-base.controller';

describe('KnowledgeBaseController', () => {
  const service = {
    findAll: jest.fn(),
    create: jest.fn(),
    search: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    publish: jest.fn(),
    unpublish: jest.fn(),
    delete: jest.fn(),
  };

  let controller: KnowledgeBaseController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new KnowledgeBaseController(service as any);
  });

  it('delegates list/create/search/detail calls', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });
    service.create.mockResolvedValue({ id: 'a1' });
    service.search.mockResolvedValue([]);
    service.findOne.mockResolvedValue({ id: 'a1' });

    await controller.list('t1', 'u1', { page: 1 } as any);
    await controller.create('t1', 'u1', { title: 'A', body: 'B' } as any);
    await controller.search('t1', 'reset');
    await controller.detail('t1', 'u1', 'a1');

    expect(service.findAll).toHaveBeenCalledWith('t1', 'u1', { page: 1 });
    expect(service.create).toHaveBeenCalledWith('t1', 'u1', { title: 'A', body: 'B' });
    expect(service.search).toHaveBeenCalledWith('t1', 'reset');
    expect(service.findOne).toHaveBeenCalledWith('t1', 'u1', 'a1');
  });

  it('delegates update/publish/unpublish/delete calls', async () => {
    service.update.mockResolvedValue({ id: 'a1' });
    service.publish.mockResolvedValue({ id: 'a1' });
    service.unpublish.mockResolvedValue({ id: 'a1' });
    service.delete.mockResolvedValue({ id: 'a1' });

    await controller.update('t1', 'u1', 'a1', { title: 'Updated' } as any);
    await controller.publish('t1', 'a1');
    await controller.unpublish('t1', 'a1');
    await controller.delete('t1', 'u1', 'a1');

    expect(service.update).toHaveBeenCalledWith('t1', 'u1', 'a1', { title: 'Updated' });
    expect(service.publish).toHaveBeenCalledWith('t1', 'a1');
    expect(service.unpublish).toHaveBeenCalledWith('t1', 'a1');
    expect(service.delete).toHaveBeenCalledWith('t1', 'u1', 'a1');
  });
});
