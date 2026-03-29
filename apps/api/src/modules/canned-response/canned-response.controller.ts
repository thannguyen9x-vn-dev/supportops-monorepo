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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PageMeta } from '../../common/dto/page-meta.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CannedResponseService } from './canned-response.service';
import { CannedResponseResponseDto } from './dto/canned-response-response.dto';
import { CreateCannedResponseDto } from './dto/create-canned-response.dto';
import { UpdateCannedResponseDto } from './dto/update-canned-response.dto';

@ApiTags('Canned Responses')
@ApiBearerAuth()
@Controller('canned-responses')
export class CannedResponseController {
  constructor(private readonly cannedResponseService: CannedResponseService) {}

  @Get()
  @Permissions({ all: ['canned-response.read'] })
  @ApiOperation({ summary: 'List canned responses' })
  list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
    @Query('q') q?: string,
  ): Promise<{ data: CannedResponseResponseDto[]; meta: PageMeta }> {
    return this.cannedResponseService.findAll(tenantId, actorId, { page, size, q });
  }

  @Post()
  @Permissions({ all: ['canned-response.write'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create canned response' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Body() dto: CreateCannedResponseDto,
  ): Promise<CannedResponseResponseDto> {
    return this.cannedResponseService.create(tenantId, actorId, dto);
  }

  @Get('search')
  @Permissions({ all: ['canned-response.read'] })
  @ApiOperation({ summary: 'Search canned responses for picker' })
  search(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Query('q') q = '',
  ): Promise<CannedResponseResponseDto[]> {
    return this.cannedResponseService.search(tenantId, actorId, q);
  }

  @Put(':id')
  @Permissions({ all: ['canned-response.write'] })
  @ApiOperation({ summary: 'Update canned response' })
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCannedResponseDto,
  ): Promise<CannedResponseResponseDto> {
    return this.cannedResponseService.update(tenantId, actorId, id, dto);
  }

  @Delete(':id')
  @Permissions({ all: ['canned-response.write'] })
  @ApiOperation({ summary: 'Soft delete canned response' })
  delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CannedResponseResponseDto> {
    return this.cannedResponseService.delete(tenantId, actorId, id);
  }
}
