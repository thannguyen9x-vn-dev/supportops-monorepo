import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  const service = {
    summary: jest.fn(),
    requestTrend: jest.fn(),
    recentActivity: jest.fn(),
  };

  let controller: DashboardController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DashboardController(service as any);
  });

  it('summary delegates to service', async () => {
    service.summary.mockResolvedValue({ scope: 'TEAM' });
    await controller.summary('t1', 'u1', ['request.read.all']);
    expect(service.summary).toHaveBeenCalledWith('t1', 'u1', ['request.read.all']);
  });

  it('requestTrend delegates to service', async () => {
    service.requestTrend.mockResolvedValue([]);
    await controller.requestTrend('t1', 'u1', ['request.read.own']);
    expect(service.requestTrend).toHaveBeenCalledWith('t1', 'u1', ['request.read.own']);
  });

  it('recentActivity delegates to service', async () => {
    service.recentActivity.mockResolvedValue([]);
    await controller.recentActivity('t1', 'u1', ['request.read.own']);
    expect(service.recentActivity).toHaveBeenCalledWith('t1', 'u1', ['request.read.own']);
  });
});
