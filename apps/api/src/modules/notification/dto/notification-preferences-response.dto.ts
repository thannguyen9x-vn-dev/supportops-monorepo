import { NotificationEventType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferenceItemDto {
  @ApiProperty({ enum: NotificationEventType })
  eventType!: NotificationEventType;

  @ApiProperty()
  inApp!: boolean;

  @ApiProperty()
  email!: boolean;
}

export class NotificationPreferencesResponseDto {
  @ApiProperty({ type: [NotificationPreferenceItemDto] })
  preferences!: NotificationPreferenceItemDto[];

  static from(items: NotificationPreferenceItemDto[]): NotificationPreferencesResponseDto {
    return { preferences: items };
  }
}
