import { Injectable } from '@nestjs/common';
import { KnowledgeBaseStatus, MembershipStatus, Prisma, UserStatus } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../common/dto/page-meta.dto';
import { ForbiddenException } from '../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';
import { KnowledgeArticleQueryDto } from './dto/knowledge-article-query.dto';
import { KnowledgeArticleResponseDto } from './dto/knowledge-article-response.dto';
import { UpdateKnowledgeArticleDto } from './dto/update-knowledge-article.dto';

type SystemRoleCode = 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN';

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    actorId: string,
    query: KnowledgeArticleQueryDto,
  ): Promise<{ data: KnowledgeArticleResponseDto[]; meta: PageMeta }> {
    const actorRoleCode = await this.getActorRole(tenantId, actorId);

    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.KnowledgeArticleWhereInput = {
      tenantId,
      isDeleted: false,
      ...(query.category ? { category: query.category } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { body: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    if (actorRoleCode === 'EMPLOYEE') {
      where.status = KnowledgeBaseStatus.PUBLISHED;
    } else if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.knowledgeArticle.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.knowledgeArticle.count({ where }),
    ]);

    return {
      data: items.map((item) => KnowledgeArticleResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async search(tenantId: string, q: string): Promise<KnowledgeArticleResponseDto[]> {
    const keyword = q.trim();
    if (!keyword) {
      return [];
    }

    const rows = await this.prisma.knowledgeArticle.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: KnowledgeBaseStatus.PUBLISHED,
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { body: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return rows.map((item) => KnowledgeArticleResponseDto.from(item));
  }

  async findOne(tenantId: string, actorId: string, id: string): Promise<KnowledgeArticleResponseDto> {
    const actorRoleCode = await this.getActorRole(tenantId, actorId);

    const article = await this.prisma.knowledgeArticle.findFirst({
      where: {
        tenantId,
        id,
        isDeleted: false,
        ...(actorRoleCode === 'EMPLOYEE' ? { status: KnowledgeBaseStatus.PUBLISHED } : {}),
      },
    });

    if (!article) {
      throw new NotFoundException('KnowledgeArticle', id);
    }

    return KnowledgeArticleResponseDto.from(article);
  }

  async create(tenantId: string, actorId: string, dto: CreateKnowledgeArticleDto): Promise<KnowledgeArticleResponseDto> {
    const actorRoleCode = await this.getActorRole(tenantId, actorId);
    if (actorRoleCode === 'EMPLOYEE') {
      throw new ForbiddenException('EMPLOYEE cannot create knowledge articles');
    }

    const created = await this.prisma.knowledgeArticle.create({
      data: {
        tenantId,
        authorId: actorId,
        title: dto.title.trim(),
        body: dto.body.trim(),
        category: dto.category?.trim() || null,
        tags: (dto.tags ?? []).map((item) => item.trim()).filter(Boolean),
      },
    });

    return KnowledgeArticleResponseDto.from(created);
  }

  async update(
    tenantId: string,
    actorId: string,
    id: string,
    dto: UpdateKnowledgeArticleDto,
  ): Promise<KnowledgeArticleResponseDto> {
    const article = await this.getMutableArticle(tenantId, id);
    await this.ensureEditDeleteAllowed(tenantId, actorId, article.authorId);

    const updated = await this.prisma.knowledgeArticle.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.body !== undefined ? { body: dto.body.trim() } : {}),
        ...(dto.category !== undefined ? { category: dto.category?.trim() || null } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags.map((item) => item.trim()).filter(Boolean) } : {}),
      },
    });

    return KnowledgeArticleResponseDto.from(updated);
  }

  async publish(tenantId: string, id: string): Promise<KnowledgeArticleResponseDto> {
    const article = await this.getMutableArticle(tenantId, id);

    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: {
        status: KnowledgeBaseStatus.PUBLISHED,
      },
    });

    return KnowledgeArticleResponseDto.from(updated);
  }

  async unpublish(tenantId: string, id: string): Promise<KnowledgeArticleResponseDto> {
    const article = await this.getMutableArticle(tenantId, id);

    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: {
        status: KnowledgeBaseStatus.DRAFT,
      },
    });

    return KnowledgeArticleResponseDto.from(updated);
  }

  async delete(tenantId: string, actorId: string, id: string): Promise<KnowledgeArticleResponseDto> {
    const article = await this.getMutableArticle(tenantId, id);
    await this.ensureEditDeleteAllowed(tenantId, actorId, article.authorId);

    const deleted = await this.prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: {
        isDeleted: true,
      },
    });

    return KnowledgeArticleResponseDto.from(deleted);
  }

  private async getMutableArticle(tenantId: string, id: string): Promise<{ id: string; authorId: string }> {
    const article = await this.prisma.knowledgeArticle.findFirst({
      where: {
        tenantId,
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!article) {
      throw new NotFoundException('KnowledgeArticle', id);
    }

    return article;
  }

  private async ensureEditDeleteAllowed(tenantId: string, actorId: string, authorId: string): Promise<void> {
    const actorRoleCode = await this.getActorRole(tenantId, actorId);
    if (actorRoleCode === 'TECHNICIAN' && authorId !== actorId) {
      throw new ForbiddenException('TECHNICIAN can only edit or delete own knowledge articles');
    }
  }

  private async getActorRole(tenantId: string, actorId: string): Promise<SystemRoleCode> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        tenantId,
        userId: actorId,
        status: MembershipStatus.ACTIVE,
        user: { status: UserStatus.ACTIVE },
      },
      select: {
        roleCode: true,
      },
    });

    if (
      membership?.roleCode === 'EMPLOYEE' ||
      membership?.roleCode === 'OPS_COORDINATOR' ||
      membership?.roleCode === 'TECHNICIAN' ||
      membership?.roleCode === 'TENANT_ADMIN'
    ) {
      return membership.roleCode;
    }

    return 'EMPLOYEE';
  }
}
