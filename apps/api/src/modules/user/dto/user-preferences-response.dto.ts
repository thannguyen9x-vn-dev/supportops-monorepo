import { ApiProperty } from '@nestjs/swagger';
import { UserPreference } from '@prisma/client';

export class UserPreferencesResponseDto {
  @ApiProperty()
  assignmentAlerts!: boolean;

  @ApiProperty()
  statusUpdateAlerts!: boolean;

  @ApiProperty()
  slaRiskAlerts!: boolean;

  @ApiProperty()
  escalationAlerts!: boolean;

  @ApiProperty()
  resolutionReminders!: boolean;

  @ApiProperty()
  requestUpdateDigest!: boolean;

  @ApiProperty()
  commentNotifications!: boolean;

  @ApiProperty()
  mentionNotifications!: boolean;

  static from(preference: UserPreference): UserPreferencesResponseDto {
    return {
      assignmentAlerts: preference.assignmentAlerts,
      statusUpdateAlerts: preference.statusUpdateAlerts,
      slaRiskAlerts: preference.slaRiskAlerts,
      escalationAlerts: preference.escalationAlerts,
      resolutionReminders: preference.resolutionReminders,
      requestUpdateDigest: preference.requestUpdateDigest,
      commentNotifications: preference.commentNotifications,
      mentionNotifications: preference.mentionNotifications,
    };
  }
}
