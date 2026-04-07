import { Module } from '@nestjs/common';
import { NotificationFanoutService } from './notification-fanout.service';
import { NotificationPreferenceController } from './notification-preference.controller';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController, NotificationPreferenceController],
  providers: [NotificationService, NotificationPreferenceService, NotificationFanoutService],
  exports: [NotificationService, NotificationPreferenceService, NotificationFanoutService],
})
export class NotificationModule {}
