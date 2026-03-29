import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationPreferencesResponseDto } from './dto/notification-preferences-response.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationPreferenceService } from './notification-preference.service';

@ApiTags('Notification Preferences')
@ApiBearerAuth()
@Controller('notification-preferences')
export class NotificationPreferenceController {
  constructor(private readonly notificationPreferenceService: NotificationPreferenceService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notification preferences' })
  async getPreferences(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
  ): Promise<NotificationPreferencesResponseDto> {
    const preferences = await this.notificationPreferenceService.getPreferences(tenantId, userId);
    return NotificationPreferencesResponseDto.from(preferences);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert current user notification preferences' })
  async upsertPreferences(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    const preferences = await this.notificationPreferenceService.upsertPreferences(tenantId, userId, dto);
    return NotificationPreferencesResponseDto.from(preferences);
  }
}
