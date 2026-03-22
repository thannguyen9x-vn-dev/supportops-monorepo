import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { RequestActivityListener } from './events/request-activity.listener';

@Module({
  controllers: [RequestController],
  providers: [RequestService, RequestActivityListener],
  exports: [RequestService],
})
export class RequestModule {}
