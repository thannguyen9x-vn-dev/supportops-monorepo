import { ReportingController } from './reporting.controller';

describe('ReportingController', () => {
  const service = {
    getOverview: jest.fn(),
  };

  let controller: ReportingController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ReportingController(service as any);
  });

  it('delegates overview call to service', async () => {
    service.getOverview.mockResolvedValue({ totalRequests: 0 });

    await controller.overview('t1', 'u1', { from: '2026-03-01', to: '2026-03-31' });

    expect(service.getOverview).toHaveBeenCalledWith('t1', 'u1', { from: '2026-03-01', to: '2026-03-31' });
  });
});
