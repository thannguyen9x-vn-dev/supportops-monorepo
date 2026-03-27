import { WorkLogController } from './work-log.controller';

describe('WorkLogController', () => {
  const service = {
    list: jest.fn(),
    detail: jest.fn(),
  };

  let controller: WorkLogController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new WorkLogController(service as any);
  });

  it('list delegates to service', async () => {
    service.list.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });

    await controller.list('t1', 'u1', ['request.read.all'], 'r1', { page: 1 } as any);

    expect(service.list).toHaveBeenCalledWith('t1', 'u1', ['request.read.all'], 'r1', { page: 1 });
  });

  it('detail delegates to service', async () => {
    service.detail.mockResolvedValue({ id: 'w1' });

    await controller.detail('t1', 'u1', ['request.read.all'], 'r1', 'w1');

    expect(service.detail).toHaveBeenCalledWith('t1', 'u1', ['request.read.all'], 'r1', 'w1');
  });
});
