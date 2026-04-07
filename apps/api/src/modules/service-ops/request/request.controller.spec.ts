import { RequestController } from './request.controller';

describe('RequestController', () => {
  const service = {
    list: jest.fn(),
    listTabCounts: jest.fn(),
    create: jest.fn(),
    listAssignees: jest.fn(),
    detail: jest.fn(),
    detailWorkflow: jest.fn(),
    updateStatus: jest.fn(),
    addComment: jest.fn(),
    listComments: jest.fn(),
    addWorkLog: jest.fn(),
    assign: jest.fn(),
    unassign: jest.fn(),
    watchRequest: jest.fn(),
    unwatchRequest: jest.fn(),
    getWatchers: jest.fn(),
  };

  let controller: RequestController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RequestController(service as any);
  });

  it('delegates list and tab-counts calls', async () => {
    service.list.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });
    service.listTabCounts.mockResolvedValue({ allRequests: 0 });

    await controller.list('t1', 'u1', ['request.read.all'], { page: 1 } as any);
    await controller.listTabCounts('t1', 'u1', ['request.read.all'], { page: 1 } as any);

    expect(service.list).toHaveBeenCalledWith('t1', 'u1', ['request.read.all'], { page: 1 });
    expect(service.listTabCounts).toHaveBeenCalledWith('t1', 'u1', ['request.read.all'], { page: 1 });
  });

  it('transition alias calls updateStatus with same payload', async () => {
    service.updateStatus.mockResolvedValue({ id: 'r1' });

    await controller.transitionStatusAlias('t1', 'u1', ['request.resolve'], 'r1', { status: 'RESOLVED' } as any);

    expect(service.updateStatus).toHaveBeenCalledWith('t1', 'u1', ['request.resolve'], 'r1', { status: 'RESOLVED' });
  });

  it('delegates comment/worklog/assignment methods', async () => {
    service.addComment.mockResolvedValue({ id: 'c1' });
    service.addWorkLog.mockResolvedValue({ id: 'w1' });

    await controller.addComment('t1', 'u1', ['comment.create.public'], 'r1', { body: 'hello' } as any);
    await controller.addWorkLog('t1', 'u1', ['request.start_work'], 'r1', { content: 'fixing' } as any);
    await controller.assign('t1', 'u1', ['request.assign'], 'r1', { assigneeId: 'u2' } as any);
    await controller.unassign('t1', 'u1', ['request.assign'], 'r1');
    await controller.watch('t1', 'u1', 'r1');
    await controller.unwatch('t1', 'u1', 'r1');
    await controller.listWatchers('t1', 'r1');

    expect(service.addComment).toHaveBeenCalled();
    expect(service.addWorkLog).toHaveBeenCalled();
    expect(service.assign).toHaveBeenCalledWith('t1', 'u1', ['request.assign'], 'r1', { assigneeId: 'u2' });
    expect(service.unassign).toHaveBeenCalledWith('t1', 'u1', ['request.assign'], 'r1');
    expect(service.watchRequest).toHaveBeenCalledWith('t1', 'u1', 'r1');
    expect(service.unwatchRequest).toHaveBeenCalledWith('t1', 'u1', 'r1');
    expect(service.getWatchers).toHaveBeenCalledWith('t1', 'r1');
  });
});
