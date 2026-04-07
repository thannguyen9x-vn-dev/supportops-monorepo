import { Injectable } from '@nestjs/common';
import { MembershipStatus, Prisma, UserStatus } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../common/dto/page-meta.dto';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { ForbiddenException } from '../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { CannedResponseResponseDto } from './dto/canned-response-response.dto';
import { CreateCannedResponseDto } from './dto/create-canned-response.dto';
import { UpdateCannedResponseDto } from './dto/update-canned-response.dto';

type SystemRoleCode = 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN';

@Injectable()
export class CannedResponseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    actorId: string,
    query: { page?: number; size?: number; q?: string },
  ): Promise<{ data: CannedResponseResponseDto[]; meta: PageMeta }> {
    await this.ensureCanRead(tenantId, actorId);

    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.CannedResponseWhereInput = {
      tenantId,
      isDeleted: false,
      ...(query.q
        ? {
            OR: [
              { shortcut: { startsWith: query.q } },
              { title: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.cannedResponse.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.cannedResponse.count({ where }),
    ]);

    return {
      data: items.map((item) => CannedResponseResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async search(tenantId: string, actorId: string, q: string): Promise<CannedResponseResponseDto[]> {
    await this.ensureCanRead(tenantId, actorId);

    const keyword = q.trim();
    if (!keyword) {
      return [];
    }

    const rows = await this.prisma.cannedResponse.findMany({
      where: {
        tenantId,
        isDeleted: false,
        OR: [
          { shortcut: { startsWith: keyword } },
          { title: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return rows.map((item) => CannedResponseResponseDto.from(item));
  }

  async create(tenantId: string, actorId: string, dto: CreateCannedResponseDto): Promise<CannedResponseResponseDto> {
    await this.ensureCanWrite(tenantId, actorId);

    try {
      const created = await this.prisma.cannedResponse.create({
        data: {
          tenantId,
          title: dto.title.trim(),
          body: dto.body,
          category: dto.category?.trim() || null,
          tags: (dto.tags ?? []).map((item) => item.trim()).filter(Boolean),
          shortcut: dto.shortcut?.trim() || null,
        },
      });

      return CannedResponseResponseDto.from(created);
    } catch (error) {
      this.handleShortcutConflict(error);
      throw error;
    }
  }

  async update(
    tenantId: string,
    actorId: string,
    id: string,
    dto: UpdateCannedResponseDto,
  ): Promise<CannedResponseResponseDto> {
    await this.ensureCanWrite(tenantId, actorId);
    await this.getActiveRecord(tenantId, id);

    try {
      const updated = await this.prisma.cannedResponse.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.body !== undefined ? { body: dto.body } : {}),
          ...(dto.category !== undefined ? { category: dto.category?.trim() || null } : {}),
          ...(dto.tags !== undefined ? { tags: dto.tags.map((item) => item.trim()).filter(Boolean) } : {}),
          ...(dto.shortcut !== undefined ? { shortcut: dto.shortcut?.trim() || null } : {}),
        },
      });

      return CannedResponseResponseDto.from(updated);
    } catch (error) {
      this.handleShortcutConflict(error);
      throw error;
    }
  }

  async delete(tenantId: string, actorId: string, id: string): Promise<CannedResponseResponseDto> {
    await this.ensureCanWrite(tenantId, actorId);
    await this.getActiveRecord(tenantId, id);

    const deleted = await this.prisma.cannedResponse.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    return CannedResponseResponseDto.from(deleted);
  }

  resolveVariables(
    body: string,
    ctx: { requesterName: string; requestCode: string; assigneeName: string },
  ): string {
    return body
      .replace(/\{\{requester_name\}\}/g, ctx.requesterName)
      .replace(/\{\{request_code\}\}/g, ctx.requestCode)
      .replace(/\{\{assignee_name\}\}/g, ctx.assigneeName);
  }

  private async ensureCanRead(tenantId: string, actorId: string): Promise<void> {
    const roleCode = await this.getActorRole(tenantId, actorId);
    if (roleCode === 'EMPLOYEE') {
      throw new ForbiddenException('EMPLOYEE cannot read canned responses');
    }
  }

  private async ensureCanWrite(tenantId: string, actorId: string): Promise<void> {
    const roleCode = await this.getActorRole(tenantId, actorId);
    if (roleCode !== 'OPS_COORDINATOR' && roleCode !== 'TENANT_ADMIN') {
      throw new ForbiddenException('Insufficient role to write canned responses');
    }
  }

  private async getActiveRecord(tenantId: string, id: string): Promise<{ id: string }> {
    const row = await this.prisma.cannedResponse.findFirst({
      where: {
        tenantId,
        id,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    if (!row) {
      throw new NotFoundException('CannedResponse', id);
    }

    return row;
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

  private handleShortcutConflict(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('CANNED_RESPONSE_SHORTCUT_EXISTS', 'Shortcut already exists in this tenant');
    }
  }
}
