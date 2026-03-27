import { AppController } from './app.controller';
import { ReadinessService } from './common/health/readiness.service';

describe('AppController', () => {
  const readinessService = {
    check: jest.fn(),
  };

  it('should return health status', () => {
    const controller = new AppController(readinessService as unknown as ReadinessService);
    expect(controller.getHealth()).toEqual({ status: 'ok' });
  });

  it('should return readiness when checks pass', async () => {
    readinessService.check.mockResolvedValue({
      status: 'ready',
      checks: { database: 'up', redis: 'up' },
    });
    const controller = new AppController(readinessService as unknown as ReadinessService);

    await expect(controller.getReadiness()).resolves.toEqual({
      status: 'ready',
      checks: { database: 'up', redis: 'up' },
    });
  });
});
