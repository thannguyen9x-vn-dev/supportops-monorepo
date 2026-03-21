import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { BulkDeleteProductsDto, BulkDeleteProductsResponseDto } from './dto/bulk-delete-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products (paginated)' })
  list(@CurrentTenant() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.productService.list(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  getById(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<ProductResponseDto> {
    return this.productService.getById(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions({ all: ['product.manage'] })
  @ApiOperation({ summary: 'Create product' })
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productService.create(tenantId, dto);
  }

  @Put(':id')
  @Permissions({ all: ['product.manage'] })
  @ApiOperation({ summary: 'Update product' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['product.manage'] })
  @ApiOperation({ summary: 'Delete product' })
  delete(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productService.delete(tenantId, id);
  }

  @Delete('bulk')
  @Permissions({ all: ['product.manage'] })
  @ApiOperation({ summary: 'Bulk delete products' })
  bulkDelete(
    @CurrentTenant() tenantId: string,
    @Body() body: BulkDeleteProductsDto,
  ): Promise<BulkDeleteProductsResponseDto> {
    return this.productService.bulkDelete(tenantId, body.ids);
  }

  @Post(':id/images')
  @Permissions({ all: ['product.manage'] })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload product images' })
  uploadImages(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files?: UploadedBinaryFile[],
  ): Promise<ProductResponseDto['images']> {
    return this.productService.uploadImages(tenantId, id, files ?? []);
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['product.manage'] })
  @ApiOperation({ summary: 'Delete one product image' })
  deleteImage(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.productService.deleteImage(tenantId, id, imageId);
  }

  @Put(':id/images/reorder')
  @Permissions({ all: ['product.manage'] })
  @ApiOperation({ summary: 'Reorder product images' })
  reorderImages(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReorderProductImagesDto,
  ): Promise<ProductResponseDto['images']> {
    return this.productService.reorderImages(tenantId, id, body.imageIds);
  }
}
