import { Prisma } from '@prisma/client';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { ForbiddenException } from '../../common/exceptions/forbidden.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { CannedResponseService } from './canned-response.service';

describe('CannedResponseService', () => {
  let service: CannedResponseService;
  let prisma: any;

  const now = new Date('2026-03-29T00:00:00.000Z');

  beforeEach(() => {
    prisma = {
      membership: {
        findFirst: jest.fn(),
      },
      cannedResponse: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'OPS_COORDINATOR' });

    service = new CannedResponseService(prisma as PrismaService);
  });

  it('EMPLOYEE cannot read canned responses (403)', async () => {
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'EMPLOYEE' });

    await expect(service.findAll('t1', 'emp-1', {})).rejects.toThrow(ForbiddenException);
  });

  it('TECHNICIAN can read but cannot write', async () => {
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'TECHNICIAN' });
    prisma.cannedResponse.findMany.mockResolvedValue([]);
    prisma.cannedResponse.count.mockResolvedValue(0);

    await expect(service.findAll('t1', 'tech-1', { page: 1, size: 20 })).resolves.toBeDefined();
    await expect(service.create('t1', 'tech-1', { title: 'A', body: 'B' })).rejects.toThrow(ForbiddenException);
  });

  it('resolveVariables replaces all supported placeholders', () => {
    const result = service.resolveVariables(
      'Hi {{requester_name}}, ticket {{request_code}} assigned to {{assignee_name}}',
      {
        requesterName: 'Alice',
        requestCode: 'SR-100',
        assigneeName: 'Bob',
      },
    );

    expect(result).toBe('Hi Alice, ticket SR-100 assigned to Bob');
  });

  it('soft delete marks isDeleted=true', async () => {
    prisma.cannedResponse.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.cannedResponse.update.mockResolvedValue({
      id: 'c1',
      tenantId: 't1',
      title: 'Title',
      body: 'Body',
      category: null,
      tags: [],
      shortcut: '/x',
      isDeleted: true,
      createdAt: now,
      updatedAt: now,
    });

    await service.delete('t1', 'ops-1', 'c1');

    expect(prisma.cannedResponse.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isDeleted: true },
    });
  });

  it('throws 409 when shortcut duplicates in same tenant', async () => {
    const duplicateError = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.cannedResponse.create.mockRejectedValue(duplicateError);

    await expect(
      service.create('t1', 'ops-1', { title: 'Duplicate', body: 'Body', shortcut: '/reset' }),
    ).rejects.toThrow(ConflictException);
  });
});
