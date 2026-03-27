import { EscalationController } from './escalation.controller';

describe('EscalationController', () => {
  const service = {
    listRules: jest.fn(),
    detailRule: jest.fn(),
    listEvents: jest.fn(),
    triggerManual: jest.fn(),
  };

  let controller: EscalationController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new EscalationController(service as any);
  });

  it('forwards listRules request to service', async () => {
    service.listRules.mockResolvedValue([]);
    await controller.listRules('t1');
    expect(service.listRules).toHaveBeenCalledWith('t1');
  });

  it('forwards trigger request with tenant, actor and permissions', async () => {
    service.triggerManual.mockResolvedValue({ id: 'r1' });

    await controller.trigger('t1', 'u1', ['request.escalate'], 'r1', { reason: 'need vendor' });

    expect(service.triggerManual).toHaveBeenCalledWith('t1', 'u1', ['request.escalate'], 'r1', {
      reason: 'need vendor',
    });
  });
});
