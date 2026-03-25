import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPermissions } from '../../../common/decorators/current-permissions.decorator';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AssignRequestDto } from './dto/assign-request.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateRequestCommentDto } from './dto/create-request-comment.dto';
import { CreateRequestWorkLogDto } from './dto/create-request-work-log.dto';
import { RequestAssigneeResponseDto } from './dto/request-assignee-response.dto';
import { RequestCommentResponseDto } from './dto/request-comment-response.dto';
import { RequestCommentQueryDto } from './dto/request-comment-query.dto';
import { RequestQueryDto } from './dto/request-query.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestTabCountsResponseDto } from './dto/request-tab-counts-response.dto';
import { RequestWorkflowDetailResponseDto } from './dto/request-workflow-detail-response.dto';
import { RequestWorkLogResponseDto } from './dto/request-work-log-response.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { RequestService } from './request.service';

@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  @Permissions({ any: ['request.read.all', 'request.read.own'] })
  @ApiOperation({ summary: 'List requests (paginated)' })
  list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') requesterId: string,
    @CurrentPermissions() permissions: string[],
    @Query() query: RequestQueryDto,
  ) {
    return this.requestService.list(tenantId, requesterId, permissions, query);
  }

  @Get('tab-counts')
  @Permissions({ any: ['request.read.all', 'request.read.own'] })
  @ApiOperation({ summary: 'Get request tab counters for list screen' })
  listTabCounts(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') requesterId: string,
    @CurrentPermissions() permissions: string[],
    @Query() query: RequestQueryDto,
  ): Promise<RequestTabCountsResponseDto> {
    return this.requestService.listTabCounts(tenantId, requesterId, permissions, query);
  }

  @Post()
  @Permissions({ all: ['request.create'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create request (draft or submit)' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') requesterId: string,
    @Body() dto: CreateRequestDto,
  ): Promise<RequestResponseDto> {
    return this.requestService.create(tenantId, requesterId, dto);
  }

  @Get('assignees')
  @Permissions({ any: ['request.assign', 'request.reassign'] })
  @ApiOperation({ summary: 'List active request assignees in current tenant' })
  listAssignees(@CurrentTenant() tenantId: string): Promise<RequestAssigneeResponseDto[]> {
    return this.requestService.listAssignees(tenantId);
  }

  @Get(':id')
  @Permissions({ any: ['request.read.all', 'request.read.own'] })
  @ApiOperation({ summary: 'Get request detail by id' })
  detail(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') requesterId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
  ): Promise<RequestResponseDto> {
    return this.requestService.detail(tenantId, requesterId, permissions, requestId);
  }

  @Get(':id/workflow')
  @Permissions({ any: ['request.read.all', 'request.read.own'] })
  @ApiOperation({ summary: 'Get request workflow aggregate for detail view' })
  workflowDetail(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') requesterId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
  ): Promise<RequestWorkflowDetailResponseDto> {
    return this.requestService.detailWorkflow(tenantId, requesterId, permissions, requestId);
  }

  @Patch(':id/status')
  @Permissions({
    any: [
      'request.create',
      'request.assign',
      'request.reassign',
      'request.start_work',
      'request.resolve',
      'request.close',
      'request.reopen',
      'request.escalate',
    ],
  })
  @ApiOperation({ summary: 'Transition request status' })
  updateStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: UpdateRequestStatusDto,
  ): Promise<RequestResponseDto> {
    return this.requestService.updateStatus(tenantId, actorId, permissions, requestId, dto);
  }

  @Patch(':id/transition')
  @Permissions({
    any: [
      'request.create',
      'request.assign',
      'request.reassign',
      'request.start_work',
      'request.resolve',
      'request.close',
      'request.reopen',
      'request.escalate',
    ],
  })
  @ApiOperation({ summary: 'Backward-compatible alias for status transition' })
  transitionStatusAlias(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: UpdateRequestStatusDto,
  ): Promise<RequestResponseDto> {
    return this.requestService.updateStatus(tenantId, actorId, permissions, requestId, dto);
  }

  @Post(':id/comments')
  @Permissions({ any: ['comment.create.public', 'comment.create.internal'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add comment to a request' })
  addComment(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') authorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: CreateRequestCommentDto,
  ): Promise<RequestCommentResponseDto> {
    return this.requestService.addComment(tenantId, authorId, permissions, requestId, dto);
  }

  @Get(':id/comments')
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work', 'comment.read.internal'] })
  @ApiOperation({ summary: 'List comments of a request' })
  listComments(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
    @Query() query: RequestCommentQueryDto,
  ) {
    return this.requestService.listComments(tenantId, actorId, permissions, requestId, query);
  }

  @Post(':id/work-log')
  @Permissions({ any: ['request.start_work', 'request.read.all'] })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add work log entry to a request' })
  addWorkLog(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') authorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: CreateRequestWorkLogDto,
  ): Promise<RequestWorkLogResponseDto> {
    return this.requestService.addWorkLog(tenantId, authorId, permissions, requestId, dto);
  }

  @Patch(':id/assign')
  @Permissions({ any: ['request.assign', 'request.reassign'] })
  @ApiOperation({ summary: 'Assign or reassign request to a user' })
  assign(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: AssignRequestDto,
  ): Promise<RequestResponseDto> {
    return this.requestService.assign(tenantId, actorId, permissions, requestId, dto);
  }

  @Patch(':id/unassign')
  @Permissions({ any: ['request.assign', 'request.reassign'] })
  @ApiOperation({ summary: 'Unassign current assignee from request' })
  unassign(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id', ParseUUIDPipe) requestId: string,
  ): Promise<RequestResponseDto> {
    return this.requestService.unassign(tenantId, actorId, permissions, requestId);
  }
}
