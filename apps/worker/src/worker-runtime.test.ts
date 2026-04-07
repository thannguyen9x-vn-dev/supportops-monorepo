import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QUEUE_NAMES, redisConfig } from './config';
import { startWorkers } from './worker-runtime';

const { workerConstructorMock, queueConstructorMock, queueAddMock } = vi.hoisted(() => ({
  workerConstructorMock: vi.fn(),
  queueConstructorMock: vi.fn(),
  queueAddMock: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(),
  Prisma: {},
  NotificationEventType: {
    BULK_IMPORT_COMPLETED: 'BULK_IMPORT_COMPLETED',
  },
  RequestPriority: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
  RequestStatus: {
    SUBMITTED: 'SUBMITTED',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
    CANCELLED: 'CANCELLED',
    WAITING_FOR_CUSTOMER: 'WAITING_FOR_CUSTOMER',
  },
  SourceChannel: {
    API: 'API',
  },
  UserStatus: {
    ACTIVE: 'ACTIVE',
  },
  SlaHealth: {
    BREACHED: 'BREACHED',
  },
}));

vi.mock('bullmq', () => ({
  Worker: workerConstructorMock,
  Queue: queueConstructorMock,
}));

describe('startWorkers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queueAddMock.mockResolvedValue({});
    queueConstructorMock.mockImplementation(() => ({
      add: queueAddMock,
    }));
    workerConstructorMock.mockImplementation((name: string) => ({
      name,
      close: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    }));
  });

  it('creates SLA and email workers with shared redis connection', () => {
    const workers = startWorkers();

    expect(workers).toHaveLength(4);
    expect(workerConstructorMock).toHaveBeenCalledTimes(4);
    expect(workerConstructorMock).toHaveBeenNthCalledWith(
      1,
      QUEUE_NAMES.SLA_MONITOR,
      expect.any(Function),
      { connection: redisConfig },
    );
    expect(workerConstructorMock).toHaveBeenNthCalledWith(
      2,
      QUEUE_NAMES.EMAIL_IMMEDIATE,
      expect.any(Function),
      { connection: redisConfig },
    );
    expect(workerConstructorMock).toHaveBeenNthCalledWith(
      3,
      QUEUE_NAMES.EMAIL_DIGEST,
      expect.any(Function),
      { connection: redisConfig },
    );
    expect(workerConstructorMock).toHaveBeenNthCalledWith(
      4,
      QUEUE_NAMES.IMPORT_REQUESTS,
      expect.any(Function),
      { connection: redisConfig },
    );
    expect(queueConstructorMock).toHaveBeenCalledWith(QUEUE_NAMES.NOTIFICATION_FANOUT, { connection: redisConfig });
    expect(queueConstructorMock).toHaveBeenCalledWith(QUEUE_NAMES.SLA_MONITOR, { connection: redisConfig });
    expect(queueAddMock).toHaveBeenCalledWith('sla-check', {}, { repeat: { every: 60_000 }, jobId: 'sla-check-recurring' });
  });
});
