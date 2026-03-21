import { Module } from '@nestjs/common';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, ObjectStorageService],
  exports: [UserService],
})
export class UserModule {}
