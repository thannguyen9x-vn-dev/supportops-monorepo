import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageMeta } from '../../common/dto/page-meta.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateKnowledgeArticleDto } from './dto/create-knowledge-article.dto';
import { KnowledgeArticleQueryDto } from './dto/knowledge-article-query.dto';
import { KnowledgeArticleResponseDto } from './dto/knowledge-article-response.dto';
import { UpdateKnowledgeArticleDto } from './dto/update-knowledge-article.dto';
import { KnowledgeBaseService } from './knowledge-base.service';

@ApiTags('Knowledge Base')
@ApiBearerAuth()
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge articles' })
  list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Query() query: KnowledgeArticleQueryDto,
  ): Promise<{ data: KnowledgeArticleResponseDto[]; meta: PageMeta }> {
    return this.knowledgeBaseService.findAll(tenantId, actorId, query);
  }

  @Post()
  @Permissions({ all: ['knowledge-base.create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a knowledge article' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Body() dto: CreateKnowledgeArticleDto,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeBaseService.create(tenantId, actorId, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search published knowledge articles for picker' })
  search(
    @CurrentTenant() tenantId: string,
    @Query('q') q = '',
  ): Promise<KnowledgeArticleResponseDto[]> {
    return this.knowledgeBaseService.search(tenantId, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge article by id' })
  detail(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeBaseService.findOne(tenantId, actorId, id);
  }

  @Put(':id')
  @Permissions({ all: ['knowledge-base.update'] })
  @ApiOperation({ summary: 'Update knowledge article' })
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeArticleDto,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeBaseService.update(tenantId, actorId, id, dto);
  }

  @Patch(':id/publish')
  @Permissions({ all: ['knowledge-base.publish'] })
  @ApiOperation({ summary: 'Publish knowledge article' })
  publish(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeBaseService.publish(tenantId, id);
  }

  @Patch(':id/unpublish')
  @Permissions({ all: ['knowledge-base.publish'] })
  @ApiOperation({ summary: 'Unpublish knowledge article' })
  unpublish(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeBaseService.unpublish(tenantId, id);
  }

  @Delete(':id')
  @Permissions({ all: ['knowledge-base.delete'] })
  @ApiOperation({ summary: 'Soft delete knowledge article' })
  delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<KnowledgeArticleResponseDto> {
    return this.knowledgeBaseService.delete(tenantId, actorId, id);
  }
}
