import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestService } from '../request/request.service';
import { ResolutionService } from './resolution.service';

describe('ResolutionService', () => {
  let service: ResolutionService;
  let prisma: any;
  let requestService: any;
  let emitter: any;

  beforeEach(() => {
    prisma = {
      auditLog: { create: jest.fn() },
    };
    requestService = { updateStatus: jest.fn() };
    emitter = { emitAsync: jest.fn().mockResolvedValue(undefined) };

    service = new ResolutionService(
      prisma as unknown as PrismaService,
      requestService as unknown as RequestService,
      emitter as unknown as EventEmitter2,
    );
  });

  it('confirm resolves request when closeImmediately is false', async () => {
    requestService.updateStatus.mockResolvedValue({ id: 'r1', status: RequestStatus.RESOLVED });

    const result = await service.confirm('t1', 'u1', ['request.resolve'], 'r1', { summary: 'fixed', closeImmediately: false });

    expect(requestService.updateStatus).toHaveBeenCalledWith('t1', 'u1', ['request.resolve'], 'r1', {
      status: RequestStatus.RESOLVED,
    });
    expect(prisma.auditLog.create).toHaveBeenCalled();
    expect(emitter.emitAsync).toHaveBeenCalled();
    expect(result.status).toBe(RequestStatus.RESOLVED);
  });

  it('confirm closes request when closeImmediately is true', async () => {
    requestService.updateStatus.mockResolvedValue({ id: 'r1', status: RequestStatus.CLOSED });

    const result = await service.confirm('t1', 'u1', ['request.close'], 'r1', { summary: 'fixed', closeImmediately: true });

    expect(requestService.updateStatus).toHaveBeenCalledWith('t1', 'u1', ['request.close'], 'r1', {
      status: RequestStatus.CLOSED,
    });
    expect(result.status).toBe(RequestStatus.CLOSED);
  });

  it('reopen transitions status to REOPENED and emits event', async () => {
    requestService.updateStatus.mockResolvedValue({ id: 'r1', status: RequestStatus.REOPENED });

    const result = await service.reopen('t1', 'u1', ['request.reopen'], 'r1', { reason: 'still broken' });

    expect(requestService.updateStatus).toHaveBeenCalledWith('t1', 'u1', ['request.reopen'], 'r1', {
      status: RequestStatus.REOPENED,
    });
    expect(prisma.auditLog.create).toHaveBeenCalled();
    expect(emitter.emitAsync).toHaveBeenCalled();
    expect(result.status).toBe(RequestStatus.REOPENED);
  });
});
