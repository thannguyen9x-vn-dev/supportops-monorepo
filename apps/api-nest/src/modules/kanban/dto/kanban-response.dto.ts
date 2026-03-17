import { ApiProperty } from '@nestjs/swagger';
import { Board, BoardColumn, Task, TaskPriority } from '@prisma/client';

export type KanbanTaskModel = Task;
export type KanbanColumnModel = BoardColumn & { tasks?: Task[] };
export type KanbanBoardModel = Board & { columns?: KanbanColumnModel[] };

export class TaskResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  columnId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: TaskPriority })
  priority!: TaskPriority;

  @ApiProperty({ nullable: true })
  dueDate!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(task: KanbanTaskModel): TaskResponseDto {
    return {
      id: task.id,
      columnId: task.columnId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString() ?? null,
      sortOrder: task.sortOrder,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}

export class BoardColumnResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  boardId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  color!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: [TaskResponseDto] })
  tasks!: TaskResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(column: KanbanColumnModel): BoardColumnResponseDto {
    return {
      id: column.id,
      boardId: column.boardId,
      name: column.name,
      color: column.color,
      sortOrder: column.sortOrder,
      tasks: (column.tasks ?? []).map((task) => TaskResponseDto.from(task)),
      createdAt: column.createdAt.toISOString(),
      updatedAt: column.updatedAt.toISOString(),
    };
  }
}

export class BoardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: [BoardColumnResponseDto] })
  columns!: BoardColumnResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(board: KanbanBoardModel): BoardResponseDto {
    return {
      id: board.id,
      tenantId: board.tenantId,
      name: board.name,
      columns: (board.columns ?? []).map((column) => BoardColumnResponseDto.from(column)),
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }
}
