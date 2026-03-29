import { Module } from '@nestjs/common';
import { NotificationModule } from '../../notification/notification.module';
import { SlaModule } from '../sla/sla.module';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { RequestActivityListener } from './events/request-activity.listener';

@Module({
  imports: [NotificationModule, SlaModule],
  controllers: [RequestController],
  providers: [RequestService, RequestActivityListener],
  exports: [RequestService],
})
export class RequestModule {}
