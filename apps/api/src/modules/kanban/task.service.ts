import { Injectable, Logger } from '@nestjs/common';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TaskResponseDto } from './dto/kanban-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTaskDto): Promise<TaskResponseDto> {
    await this.ensureColumn(tenantId, dto.columnId);

    const task = await this.prisma.task.create({
      data: {
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    this.logger.log(`Task created: id=${task.id}, tenantId=${tenantId}`);
    return TaskResponseDto.from(task);
  }

  async getById(tenantId: string, id: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        column: {
          board: {
            tenantId,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task', id);
    }

    return TaskResponseDto.from(task);
  }

  async update(tenantId: string, id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    await this.ensureTask(tenantId, id);

    if (dto.columnId) {
      await this.ensureColumn(tenantId, dto.columnId);
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.columnId !== undefined && { columnId: dto.columnId }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });

    return TaskResponseDto.from(task);
  }

  async move(tenantId: string, id: string, dto: MoveTaskDto): Promise<TaskResponseDto> {
    await this.ensureTask(tenantId, id);
    await this.ensureColumn(tenantId, dto.columnId);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        columnId: dto.columnId,
        sortOrder: dto.sortOrder,
      },
    });

    this.logger.log(`Task moved: id=${task.id}, tenantId=${tenantId}, columnId=${dto.columnId}, sortOrder=${dto.sortOrder}`);
    return TaskResponseDto.from(task);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.ensureTask(tenantId, id);

    await this.prisma.task.delete({
      where: { id },
    });

    this.logger.log(`Task deleted: id=${id}, tenantId=${tenantId}`);
  }

  private async ensureColumn(tenantId: string, columnId: string): Promise<void> {
    const column = await this.prisma.boardColumn.findFirst({
      where: {
        id: columnId,
        board: {
          tenantId,
        },
      },
      select: { id: true },
    });

    if (!column) {
      throw new NotFoundException('BoardColumn', columnId);
    }
  }

  private async ensureTask(tenantId: string, taskId: string): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        column: {
          board: {
            tenantId,
          },
        },
      },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException('Task', taskId);
    }
  }
}
