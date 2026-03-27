import { SettingsController } from './settings.controller';

describe('SettingsController', () => {
  const service = {
    listServiceTypes: jest.fn(),
    createServiceType: jest.fn(),
    updateServiceType: jest.fn(),
    deleteServiceType: jest.fn(),
    listSlaPolicies: jest.fn(),
    createSlaPolicy: jest.fn(),
    updateSlaPolicy: jest.fn(),
    deleteSlaPolicy: jest.fn(),
    listWorkflowTransitions: jest.fn(),
    createWorkflowTransition: jest.fn(),
    updateWorkflowTransition: jest.fn(),
    deleteWorkflowTransition: jest.fn(),
  };

  let controller: SettingsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SettingsController(service as any);
  });

  it('delegates service-type operations', async () => {
    service.listServiceTypes.mockResolvedValue([]);
    service.createServiceType.mockResolvedValue({ id: '1' });

    await controller.listServiceTypes('t1');
    await controller.createServiceType('t1', { code: 'IT', name: 'IT' } as any);

    expect(service.listServiceTypes).toHaveBeenCalledWith('t1');
    expect(service.createServiceType).toHaveBeenCalledWith('t1', { code: 'IT', name: 'IT' });
  });

  it('delegates sla-policy operations', async () => {
    service.updateSlaPolicy.mockResolvedValue({ id: 'p1' });
    await controller.updateSlaPolicy('t1', 'p1', { responseMinutes: 30 } as any);
    expect(service.updateSlaPolicy).toHaveBeenCalledWith('t1', 'p1', { responseMinutes: 30 });
  });

  it('delegates workflow-transition operations', async () => {
    service.deleteWorkflowTransition.mockResolvedValue(undefined);
    await controller.deleteWorkflowTransition('t1', 'w1');
    expect(service.deleteWorkflowTransition).toHaveBeenCalledWith('t1', 'w1');
  });
});
