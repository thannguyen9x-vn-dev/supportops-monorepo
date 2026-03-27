import { ResolutionController } from './resolution.controller';

describe('ResolutionController', () => {
  const service = {
    confirm: jest.fn(),
    reopen: jest.fn(),
  };

  let controller: ResolutionController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ResolutionController(service as any);
  });

  it('confirm delegates to service', async () => {
    service.confirm.mockResolvedValue({ id: 'r1' });

    await controller.confirm('t1', 'u1', ['request.resolve'], 'r1', { summary: 'done' } as any);

    expect(service.confirm).toHaveBeenCalledWith('t1', 'u1', ['request.resolve'], 'r1', { summary: 'done' });
  });

  it('reopen delegates to service', async () => {
    service.reopen.mockResolvedValue({ id: 'r1' });

    await controller.reopen('t1', 'u1', ['request.reopen'], 'r1', { reason: 'bad' });

    expect(service.reopen).toHaveBeenCalledWith('t1', 'u1', ['request.reopen'], 'r1', { reason: 'bad' });
  });
});
