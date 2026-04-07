import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { SlaService } from '../sla/sla.service';
import { RequestController } from './request.controller';
import { RequestBulkService } from './request-bulk.service';
import { RequestImportService } from './request-import.service';
import { RequestService } from './request.service';

describe('RequestModule Integration', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [RequestController],
      providers: [
        RequestService,
        {
          provide: PrismaService,
          useValue: {
            serviceRequest: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
            membership: { findMany: jest.fn(), findFirst: jest.fn() },
            $transaction: jest.fn((queries: unknown[]) => Promise.all(queries as Promise<unknown>[])),
          },
        },
        { provide: EventEmitter2, useValue: { emitAsync: jest.fn() } },
        { provide: SlaService, useValue: { pauseSla: jest.fn(), resumeSla: jest.fn() } },
        { provide: RequestImportService, useValue: { uploadAndEnqueue: jest.fn() } },
        { provide: RequestBulkService, useValue: { bulkCreate: jest.fn() } },
      ],
    }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('wires controller and service in testing module', () => {
    const controller = moduleRef.get(RequestController);
    const service = moduleRef.get(RequestService);

    expect(controller).toBeInstanceOf(RequestController);
    expect(service).toBeInstanceOf(RequestService);
  });
});
