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
import { Permissions } from '../../common/decorators/permissions.decorator';
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
  @Permissions({ all: ['kanban.manage'] })
  @ApiOperation({ summary: 'Create board' })
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.create(tenantId, dto);
  }

  @Put(':id')
  @Permissions({ all: ['kanban.manage'] })
  @ApiOperation({ summary: 'Update board' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['kanban.manage'] })
  @ApiOperation({ summary: 'Delete board' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.boardService.delete(tenantId, id);
  }

  @Post(':boardId/columns')
  @HttpCode(HttpStatus.CREATED)
  @Permissions({ all: ['kanban.manage'] })
  @ApiOperation({ summary: 'Create board column' })
  createColumn(
    @CurrentTenant() tenantId: string,
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() dto: CreateColumnDto,
  ): Promise<BoardColumnResponseDto> {
    return this.boardService.createColumn(tenantId, boardId, dto);
  }

  @Put(':boardId/columns/:columnId')
  @Permissions({ all: ['kanban.manage'] })
  @ApiOperation({ summary: 'Update board column' })
  updateColumn(
    @CurrentTenant() tenantId: string,
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() dto: UpdateColumnDto,
  ): Promise<BoardColumnResponseDto> {
    return this.boardService.updateColumn(tenantId, boardId, columnId, dto);
  }

  @Delete(':boardId/columns/:columnId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['kanban.manage'] })
  @ApiOperation({ summary: 'Delete board column' })
  async deleteColumn(
    @CurrentTenant() tenantId: string,
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Param('columnId', ParseUUIDPipe) columnId: string,
  ): Promise<void> {
    await this.boardService.deleteColumn(tenantId, boardId, columnId);
  }
}
