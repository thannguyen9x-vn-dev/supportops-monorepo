import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

@Module({
  imports: [HttpModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
