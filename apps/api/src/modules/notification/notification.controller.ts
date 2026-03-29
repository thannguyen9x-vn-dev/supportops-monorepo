import {
  Controller,
  Get,
  MessageEvent,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { NotificationListResponseDto } from './dto/notification-list-response.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Permissions({ all: ['notification.read.own'] })
  @ApiOperation({ summary: 'List current user notifications' })
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ): Promise<NotificationListResponseDto> {
    return this.notificationService.findAll(tenantId, userId, query);
  }

  @Patch('read-all')
  @Permissions({ all: ['notification.update.own'] })
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  markAllRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
  ): Promise<{ count: number }> {
    return this.notificationService.markAllRead(tenantId, userId);
  }

  @Patch(':id/read')
  @Permissions({ all: ['notification.update.own'] })
  @ApiOperation({ summary: 'Mark one notification as read' })
  markRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markRead(tenantId, userId, id);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  async getUnreadCount(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
  ): Promise<{ count: number }> {
    return { count: await this.notificationService.getUnreadCount(tenantId, userId) };
  }

  @Get('stream')
  @Sse()
  @ApiOperation({ summary: 'SSE stream for current user notifications' })
  stream(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
  ): Observable<MessageEvent> {
    return this.notificationService.streamForUser(tenantId, userId);
  }
}
