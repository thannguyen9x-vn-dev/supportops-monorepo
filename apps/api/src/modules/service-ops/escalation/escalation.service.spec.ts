import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatus } from '@prisma/client';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestService } from '../request/request.service';
import { EscalationService } from './escalation.service';

describe('EscalationService', () => {
  let service: EscalationService;
  let prisma: any;
  let requestService: any;
  let emitter: any;

  beforeEach(() => {
    prisma = {
      serviceType: { findMany: jest.fn(), findFirst: jest.fn() },
      auditLog: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));

    requestService = { updateStatus: jest.fn() };
    emitter = { emitAsync: jest.fn().mockResolvedValue(undefined) };

    service = new EscalationService(
      prisma as unknown as PrismaService,
      requestService as unknown as RequestService,
      emitter as unknown as EventEmitter2,
    );
  });

  it('listRules returns GENERAL rule when no service types', async () => {
    prisma.serviceType.findMany.mockResolvedValue([]);

    const result = await service.listRules('t1');

    expect(result).toHaveLength(1);
    expect(result[0]?.serviceTypeCode).toBe('GENERAL');
  });

  it('detailRule throws when id has empty code', async () => {
    await expect(service.detailRule('t1', 'escalation-rule-')).rejects.toThrow(NotFoundException);
  });

  it('triggerManual updates request, writes audit log and emits event', async () => {
    requestService.updateStatus.mockResolvedValue({ id: 'r1', status: RequestStatus.WAITING_EXTERNAL_VENDOR });

    const result = await service.triggerManual('t1', 'u1', ['request.escalate'], 'r1', { reason: 'Need vendor' });

    expect(requestService.updateStatus).toHaveBeenCalledWith('t1', 'u1', ['request.escalate'], 'r1', {
      status: RequestStatus.WAITING_EXTERNAL_VENDOR,
    });
    expect(prisma.auditLog.create).toHaveBeenCalled();
    expect(emitter.emitAsync).toHaveBeenCalled();
    expect(result.status).toBe(RequestStatus.WAITING_EXTERNAL_VENDOR);
  });
});
