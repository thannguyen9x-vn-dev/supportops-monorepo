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
import { Role } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { BoardColumnResponseDto, BoardResponseDto } from './dto/kanban-response.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@ApiTags('Kanban')
@ApiBearerAuth()
@Controller('kanban/boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @ApiOperation({ summary: 'List boards with columns and tasks' })
  list(@CurrentTenant() tenantId: string): Promise<BoardResponseDto[]> {
    return this.boardService.list(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  getById(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<BoardResponseDto> {
    return this.boardService.getById(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create board' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.create(tenantId, role, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update board' })
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.update(tenantId, role, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete board' })
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.boardService.delete(tenantId, role, id);
  }

  @Post(':boardId/columns')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create board column' })
  createColumn(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateColumnDto,
  ): Promise<BoardColumnResponseDto> {
    return this.boardService.createColumn(tenantId, role, boardId, dto);
  }

  @Put(':boardId/columns/:columnId')
  @ApiOperation({ summary: 'Update board column' })
  updateColumn(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: UpdateColumnDto,
  ): Promise<BoardColumnResponseDto> {
    return this.boardService.updateColumn(tenantId, role, boardId, columnId, dto);
  }

  @Delete(':boardId/columns/:columnId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete board column' })
  async deleteColumn(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('columnId', ParseUUIDPipe) columnId: string,
  ): Promise<void> {
    await this.boardService.deleteColumn(tenantId, role, boardId, columnId);
  }
}
