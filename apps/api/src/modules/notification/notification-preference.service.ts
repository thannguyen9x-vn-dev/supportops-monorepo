import { Injectable } from '@nestjs/common';
import { NotificationEventType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotificationPreferenceItemDto,
} from './dto/notification-preferences-response.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

const ALL_EVENT_TYPES: NotificationEventType[] = Object.values(NotificationEventType);

@Injectable()
export class NotificationPreferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(
    tenantId: string,
    userId: string,
    eventType: NotificationEventType,
  ): Promise<NotificationPreferenceItemDto> {
    const preference = await this.prisma.notificationPreference.findFirst({
      where: {
        tenantId,
        userId,
        eventType,
      },
      select: {
        eventType: true,
        inApp: true,
        email: true,
      },
    });

    return {
      eventType,
      inApp: preference?.inApp ?? true,
      email: preference?.email ?? true,
    };
  }

  async getPreferences(tenantId: string, userId: string): Promise<NotificationPreferenceItemDto[]> {
    const existing = await this.prisma.notificationPreference.findMany({
      where: {
        tenantId,
        userId,
      },
      select: {
        eventType: true,
        inApp: true,
        email: true,
      },
    });

    const existingMap = new Map(existing.map((item) => [item.eventType, item]));
    return ALL_EVENT_TYPES.map((eventType) => ({
      eventType,
      inApp: existingMap.get(eventType)?.inApp ?? true,
      email: existingMap.get(eventType)?.email ?? true,
    }));
  }

  async upsertPreferences(
    tenantId: string,
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferenceItemDto[]> {
    await this.prisma.$transaction(
      dto.preferences.map((item) =>
        this.prisma.notificationPreference.upsert({
          where: {
            userId_eventType: {
              userId,
              eventType: item.eventType,
            },
          },
          create: {
            tenantId,
            userId,
            eventType: item.eventType,
            inApp: item.inApp,
            email: item.email,
          },
          update: {
            inApp: item.inApp,
            email: item.email,
          },
        }),
      ),
    );

    return this.getPreferences(tenantId, userId);
  }
}
