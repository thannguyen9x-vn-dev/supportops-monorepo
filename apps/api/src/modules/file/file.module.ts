import { Module } from '@nestjs/common';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  controllers: [FileController],
  providers: [FileService, ObjectStorageService],
  exports: [FileService],
})
export class FileModule {}
