import { Module } from '@nestjs/common';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ObjectStorageService],
  exports: [ProductService],
})
export class ProductModule {}
