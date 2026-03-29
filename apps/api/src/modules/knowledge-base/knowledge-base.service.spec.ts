import { KnowledgeBaseStatus } from '@prisma/client';
import { ForbiddenException } from '../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeBaseService } from './knowledge-base.service';

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService;
  let prisma: any;

  const now = new Date('2026-03-29T00:00:00.000Z');

  const article = {
    id: 'a1',
    tenantId: 't1',
    title: 'Reset password',
    body: 'Reset steps',
    category: 'auth',
    tags: ['password'],
    status: KnowledgeBaseStatus.PUBLISHED,
    authorId: 'tech-1',
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    prisma = {
      membership: {
        findFirst: jest.fn(),
      },
      knowledgeArticle: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'TECHNICIAN' });

    service = new KnowledgeBaseService(prisma as PrismaService);
  });

  it('EMPLOYEE only sees published articles', async () => {
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'EMPLOYEE' });
    prisma.knowledgeArticle.findMany.mockResolvedValue([article]);
    prisma.knowledgeArticle.count.mockResolvedValue(1);

    await service.findAll('t1', 'emp-1', { page: 1, size: 20 });

    expect(prisma.knowledgeArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 't1',
          isDeleted: false,
          status: KnowledgeBaseStatus.PUBLISHED,
        }),
      }),
    );
  });

  it('EMPLOYEE cannot create article', async () => {
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'EMPLOYEE' });

    await expect(
      service.create('t1', 'emp-1', { title: 'A', body: 'B', tags: [] }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('TECHNICIAN can only edit or delete own article', async () => {
    prisma.knowledgeArticle.findFirst.mockResolvedValue({ id: 'a2', authorId: 'tech-2' });

    await expect(service.update('t1', 'tech-1', 'a2', { title: 'Updated' })).rejects.toThrow(ForbiddenException);
    await expect(service.delete('t1', 'tech-1', 'a2')).rejects.toThrow(ForbiddenException);
  });

  it('OPS_COORDINATOR can edit and delete any article', async () => {
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'OPS_COORDINATOR' });
    prisma.knowledgeArticle.findFirst.mockResolvedValue({ id: 'a2', authorId: 'tech-2' });
    prisma.knowledgeArticle.update.mockResolvedValue({ ...article, id: 'a2', title: 'Updated', authorId: 'tech-2' });

    await expect(service.update('t1', 'ops-1', 'a2', { title: 'Updated' })).resolves.toBeDefined();
    await expect(service.delete('t1', 'ops-1', 'a2')).resolves.toBeDefined();
  });

  it('search returns results based on q', async () => {
    prisma.knowledgeArticle.findMany.mockResolvedValue([article]);

    const result = await service.search('t1', 'reset');

    expect(prisma.knowledgeArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 't1',
          status: KnowledgeBaseStatus.PUBLISHED,
          isDeleted: false,
        }),
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('soft delete updates isDeleted=true and findAll excludes deleted items', async () => {
    prisma.knowledgeArticle.findFirst
      .mockResolvedValueOnce({ id: 'a1', authorId: 'tech-1' })
      .mockResolvedValueOnce(article);
    prisma.knowledgeArticle.update.mockResolvedValue({ ...article, isDeleted: true });
    prisma.knowledgeArticle.findMany.mockResolvedValue([]);
    prisma.knowledgeArticle.count.mockResolvedValue(0);

    const deleted = await service.delete('t1', 'tech-1', 'a1');
    await service.findAll('t1', 'tech-1', { page: 1, size: 20 });

    expect(prisma.knowledgeArticle.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: { isDeleted: true },
    });
    expect(prisma.knowledgeArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isDeleted: false }),
      }),
    );
    expect(deleted.id).toBe('a1');
  });

  it('tenant isolation: cannot access article from another tenant', async () => {
    prisma.knowledgeArticle.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-a', 'tech-1', 'article-from-b')).rejects.toThrow(NotFoundException);
    expect(prisma.knowledgeArticle.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-a',
          id: 'article-from-b',
        }),
      }),
    );
  });
});
