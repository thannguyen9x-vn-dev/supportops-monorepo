import { NotificationEventType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, ValidateNested } from 'class-validator';

export class UpdateNotificationPreferenceItemDto {
  @ApiProperty({ enum: NotificationEventType })
  @IsEnum(NotificationEventType)
  eventType!: NotificationEventType;

  @ApiProperty()
  @IsBoolean()
  inApp!: boolean;

  @ApiProperty()
  @IsBoolean()
  email!: boolean;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({ type: [UpdateNotificationPreferenceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateNotificationPreferenceItemDto)
  preferences!: UpdateNotificationPreferenceItemDto[];
}
