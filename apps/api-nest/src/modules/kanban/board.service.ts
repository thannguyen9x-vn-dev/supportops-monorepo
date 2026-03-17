import { Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ForbiddenException } from '../../common/exceptions/forbidden.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardResponseDto, BoardColumnResponseDto } from './dto/kanban-response.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string): Promise<BoardResponseDto[]> {
    const boards = await this.prisma.board.findMany({
      where: { tenantId },
      include: {
        columns: {
          orderBy: { sortOrder: 'asc' },
          include: {
            tasks: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return boards.map((board) => BoardResponseDto.from(board));
  }

  async getById(tenantId: string, id: string): Promise<BoardResponseDto> {
    const board = await this.prisma.board.findFirst({
      where: { id, tenantId },
      include: {
        columns: {
          orderBy: { sortOrder: 'asc' },
          include: {
            tasks: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board', id);
    }

    return BoardResponseDto.from(board);
  }

  async create(tenantId: string, userRole: Role, dto: CreateBoardDto): Promise<BoardResponseDto> {
    this.ensureBoardAdminRole(userRole);

    const board = await this.prisma.board.create({
      data: {
        tenantId,
        name: dto.name,
        columns: {
          create:
            dto.columns?.map((column, index) => ({
              name: column.name,
              color: column.color,
              sortOrder: column.sortOrder ?? index,
            })) ?? [],
        },
      },
      include: {
        columns: {
          orderBy: { sortOrder: 'asc' },
          include: {
            tasks: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    this.logger.log(`Board created: id=${board.id}, tenantId=${tenantId}`);
    return BoardResponseDto.from(board);
  }

  async update(tenantId: string, userRole: Role, id: string, dto: UpdateBoardDto): Promise<BoardResponseDto> {
    this.ensureBoardAdminRole(userRole);
    await this.ensureBoard(tenantId, id);

    const board = await this.prisma.board.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
      },
      include: {
        columns: {
          orderBy: { sortOrder: 'asc' },
          include: {
            tasks: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    this.logger.log(`Board updated: id=${id}, tenantId=${tenantId}`);
    return BoardResponseDto.from(board);
  }

  async delete(tenantId: string, userRole: Role, id: string): Promise<void> {
    this.ensureBoardAdminRole(userRole);
    await this.ensureBoard(tenantId, id);

    await this.prisma.board.delete({ where: { id } });
    this.logger.log(`Board deleted: id=${id}, tenantId=${tenantId}`);
  }

  async createColumn(
    tenantId: string,
    userRole: Role,
    boardId: string,
    dto: CreateColumnDto,
  ): Promise<BoardColumnResponseDto> {
    this.ensureBoardAdminRole(userRole);
    await this.ensureBoard(tenantId, boardId);

    const column = await this.prisma.boardColumn.create({
      data: {
        boardId,
        name: dto.name,
        color: dto.color,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { tasks: { orderBy: { sortOrder: 'asc' } } },
    });

    return BoardColumnResponseDto.from(column);
  }

  async updateColumn(
    tenantId: string,
    userRole: Role,
    boardId: string,
    columnId: string,
    dto: UpdateColumnDto,
  ): Promise<BoardColumnResponseDto> {
    this.ensureBoardAdminRole(userRole);
    await this.ensureBoard(tenantId, boardId);

    const existing = await this.prisma.boardColumn.findFirst({
      where: {
        id: columnId,
        boardId,
        board: { tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('BoardColumn', columnId);
    }

    const column = await this.prisma.boardColumn.update({
      where: { id: columnId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
      include: { tasks: { orderBy: { sortOrder: 'asc' } } },
    });

    return BoardColumnResponseDto.from(column);
  }

  async deleteColumn(tenantId: string, userRole: Role, boardId: string, columnId: string): Promise<void> {
    this.ensureBoardAdminRole(userRole);
    await this.ensureBoard(tenantId, boardId);

    const existing = await this.prisma.boardColumn.findFirst({
      where: {
        id: columnId,
        boardId,
        board: { tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('BoardColumn', columnId);
    }

    await this.prisma.boardColumn.delete({ where: { id: columnId } });
  }

  private async ensureBoard(tenantId: string, boardId: string): Promise<void> {
    const board = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        tenantId,
      },
      select: { id: true },
    });

    if (!board) {
      throw new NotFoundException('Board', boardId);
    }
  }

  private ensureBoardAdminRole(role: Role): void {
    if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Insufficient permissions to manage board structure');
    }
  }
}
