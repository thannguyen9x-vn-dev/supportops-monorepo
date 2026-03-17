import { Module } from '@nestjs/common';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ObjectStorageService],
  exports: [UserService],
})
export class UserModule {}
