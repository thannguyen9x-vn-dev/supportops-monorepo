import { AssignmentController } from './assignment.controller';

describe('AssignmentController', () => {
  const service = {
    list: jest.fn(),
  };

  let controller: AssignmentController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AssignmentController(service as any);
  });

  it('delegates list call to service', async () => {
    service.list.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });

    await controller.list('t1', { page: 1, size: 20 });

    expect(service.list).toHaveBeenCalledWith('t1', { page: 1, size: 20 });
  });
});
