import { SlaController } from './sla.controller';

describe('SlaController', () => {
  const service = {
    listPolicies: jest.fn(),
    detailPolicy: jest.fn(),
    listViolations: jest.fn(),
  };

  let controller: SlaController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SlaController(service as any);
  });

  it('listPolicies delegates to service', async () => {
    service.listPolicies.mockResolvedValue([]);
    await controller.listPolicies('t1');
    expect(service.listPolicies).toHaveBeenCalledWith('t1');
  });

  it('detailPolicy delegates to service', async () => {
    service.detailPolicy.mockResolvedValue({ id: 'policy-general' });
    await controller.detailPolicy('t1', 'policy-general');
    expect(service.detailPolicy).toHaveBeenCalledWith('t1', 'policy-general');
  });

  it('listViolations delegates to service', async () => {
    service.listViolations.mockResolvedValue({ data: [], meta: { page: 1, size: 20, total: 0, totalPages: 0 } });
    await controller.listViolations('t1', { page: 1 } as any);
    expect(service.listViolations).toHaveBeenCalledWith('t1', { page: 1 });
  });
});
