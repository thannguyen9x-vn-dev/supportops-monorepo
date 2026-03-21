import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: AssignmentQueryDto): Promise<{ data: AssignmentResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.AssignmentHistoryWhereInput = {
      tenantId,
      ...(query.requestId ? { requestId: query.requestId } : {}),
      ...(query.assigneeId ? { toAssigneeId: query.assigneeId } : {}),
      ...(query.changedById ? { changedById: query.changedById } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.assignmentHistory.findMany({
        where,
        orderBy: { changedAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.assignmentHistory.count({ where }),
    ]);

    return {
      data: items.map((item) => AssignmentResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }
}
