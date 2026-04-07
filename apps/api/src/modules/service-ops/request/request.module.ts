import { Module } from '@nestjs/common';
import { NotificationModule } from '../../notification/notification.module';
import { SlaModule } from '../sla/sla.module';
import { ObjectStorageService } from '../../../common/storage/object-storage.service';
import { RequestController } from './request.controller';
import { RequestBulkService } from './request-bulk.service';
import { RequestImportService } from './request-import.service';
import { RequestService } from './request.service';
import { RequestActivityListener } from './events/request-activity.listener';

@Module({
  imports: [NotificationModule, SlaModule],
  controllers: [RequestController],
  providers: [
    RequestService,
    RequestActivityListener,
    RequestImportService,
    RequestBulkService,
    ObjectStorageService,
  ],
  exports: [RequestService],
})
export class RequestModule {}
