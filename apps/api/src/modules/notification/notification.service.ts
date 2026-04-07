import { Injectable, MessageEvent, OnModuleDestroy } from '@nestjs/common';
import { Notification, NotificationEventType, Prisma } from '@prisma/client';
import { Observable, Subject } from 'rxjs';
import { PageMeta, pageMetaOf } from '../../common/dto/page-meta.dto';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationListResponseDto } from './dto/notification-list-response.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

export interface CreateNotificationData {
  tenantId: string;
  userId: string;
  type: NotificationEventType;
  title: string;
  body: string;
  requestId?: string | null;
  actorId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class NotificationService implements OnModuleDestroy {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    userId: string,
    query: NotificationQueryDto,
  ): Promise<NotificationListResponseDto> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.NotificationWhereInput = {
      tenantId,
      userId,
      ...(query.unread ? { isRead: false } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: items.map((item) => this.mapNotification(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async markRead(tenantId: string, userId: string, id: string): Promise<NotificationResponseDto> {
    const existing = await this.prisma.notification.findFirst({
      where: {
        id,
        tenantId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Notification', id);
    }

    const updated = existing.isRead
      ? existing
      : await this.prisma.notification.update({
          where: { id: existing.id },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

    await this.emitUnreadCount(tenantId, userId);
    return this.mapNotification(updated);
  }

  async markAllRead(tenantId: string, userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        tenantId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    await this.emitUnreadCount(tenantId, userId);
    return { count: result.count };
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        tenantId,
        userId,
        isRead: false,
      },
    });
  }

  async createNotification(data: CreateNotificationData): Promise<NotificationResponseDto> {
    const created = await this.prisma.notification.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        requestId: data.requestId ?? null,
        actorId: data.actorId ?? null,
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
      },
    });

    const stream = this.getOrCreateStream(data.tenantId, data.userId);
    stream.next({
      type: 'notification.created',
      data: { notificationId: created.id },
    });
    await this.emitUnreadCount(data.tenantId, data.userId);

    return this.mapNotification(created);
  }

  streamForUser(tenantId: string, userId: string): Observable<MessageEvent> {
    return this.getOrCreateStream(tenantId, userId).asObservable();
  }

  onModuleDestroy(): void {
    this.streams.forEach((stream) => stream.complete());
    this.streams.clear();
  }

  private mapNotification(model: Notification): NotificationResponseDto {
    return NotificationResponseDto.from(model);
  }

  private getOrCreateStream(tenantId: string, userId: string): Subject<MessageEvent> {
    const key = `${tenantId}:${userId}`;
    const existing = this.streams.get(key);
    if (existing) {
      return existing;
    }

    const stream = new Subject<MessageEvent>();
    this.streams.set(key, stream);
    return stream;
  }

  private async emitUnreadCount(tenantId: string, userId: string): Promise<void> {
    const stream = this.getOrCreateStream(tenantId, userId);
    const count = await this.getUnreadCount(tenantId, userId);
    stream.next({
      type: 'notification.unread_count',
      data: { count },
    });
  }
}
