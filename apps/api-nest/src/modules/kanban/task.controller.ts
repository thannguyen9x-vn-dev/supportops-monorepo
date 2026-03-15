import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TaskResponseDto } from './dto/kanban-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@ApiTags('Kanban')
@ApiBearerAuth()
@Controller('kanban/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  getById(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<TaskResponseDto> {
    return this.taskService.getById(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create task' })
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateTaskDto): Promise<TaskResponseDto> {
    return this.taskService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.update(tenantId, id, dto);
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move task to another column/order' })
  move(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveTaskDto,
  ): Promise<TaskResponseDto> {
    return this.taskService.move(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  async delete(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.taskService.delete(tenantId, id);
  }
}
