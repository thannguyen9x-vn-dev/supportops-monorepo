import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PageMeta, pageMetaOf } from '../../common/dto/page-meta.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkDeleteProductsResponseDto } from './dto/bulk-delete-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductImageResponseDto, ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private static readonly MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
  private static readonly MAX_IMAGES_PER_PRODUCT = 5;
  private static readonly ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  async list(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: ProductResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where = {
      tenantId,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
      ...(query.category ? { category: { contains: query.category, mode: 'insensitive' as const } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items.map((item) => ProductResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async getById(tenantId: string, id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!product) {
      throw new NotFoundException('Product', id);
    }

    return ProductResponseDto.from(product);
  }

  async create(tenantId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        subtitle: dto.subtitle,
        category: dto.category,
        brand: dto.brand,
        price: dto.price,
        details: dto.details,
      },
      include: { images: true },
    });

    this.logger.log(`Product created: id=${product.id}, tenantId=${tenantId}`);
    return ProductResponseDto.from(product);
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const existing = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Product', id);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.details !== undefined && { details: dto.details }),
      },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    this.logger.log(`Product updated: id=${id}, tenantId=${tenantId}`);
    return ProductResponseDto.from(product);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Product', id);
    }

    for (const image of await this.prisma.productImage.findMany({ where: { productId: id } })) {
      await this.objectStorageService.deleteObjectByUrl(image.url);
    }

    await this.prisma.product.delete({ where: { id } });
    this.logger.log(`Product deleted: id=${id}, tenantId=${tenantId}`);
  }

  async bulkDelete(tenantId: string, ids: string[]): Promise<BulkDeleteProductsResponseDto> {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: ids },
        tenantId,
      },
      select: { id: true, images: true },
    });

    for (const product of products) {
      for (const image of product.images) {
        await this.objectStorageService.deleteObjectByUrl(image.url);
      }
    }

    await this.prisma.product.deleteMany({
      where: { id: { in: products.map((product) => product.id) }, tenantId },
    });

    this.logger.log(`Products bulk deleted: count=${products.length}, tenantId=${tenantId}`);
    return { deletedCount: products.length };
  }

  async uploadImages(tenantId: string, productId: string, files: UploadedBinaryFile[]): Promise<ProductImageResponseDto[]> {
    if (!files.length) {
      throw new UnprocessableEntityException('At least one image file is required');
    }

    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!product) {
      throw new NotFoundException('Product', productId);
    }

    if (product.images.length + files.length > ProductService.MAX_IMAGES_PER_PRODUCT) {
      throw new UnprocessableEntityException('Maximum 5 images per product');
    }

    let nextSortOrder = (product.images.at(-1)?.sortOrder ?? 0) + 1;
    for (const file of files) {
      this.validateImageFile(file);
      const key = this.buildImageObjectKey(tenantId, productId, file.originalname);
      const imageUrl = await this.objectStorageService.uploadPublicObject(key, file.buffer);

      await this.prisma.productImage.create({
        data: {
          productId,
          url: imageUrl,
          sortOrder: nextSortOrder,
        },
      });
      nextSortOrder += 1;
    }

    const images = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    return images.map((image) => ProductImageResponseDto.from(image));
  }

  async deleteImage(tenantId: string, productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
        product: {
          tenantId,
        },
      },
    });
    if (!image) {
      throw new NotFoundException('Product image', imageId);
    }

    await this.objectStorageService.deleteObjectByUrl(image.url);
    await this.prisma.productImage.delete({
      where: { id: image.id },
    });
  }

  async reorderImages(tenantId: string, productId: string, imageIds: string[]): Promise<ProductImageResponseDto[]> {
    if (!imageIds.length) {
      throw new UnprocessableEntityException('imageIds is required');
    }

    const images = await this.prisma.productImage.findMany({
      where: {
        productId,
        product: {
          tenantId,
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (!images.length) {
      throw new NotFoundException('Product images', productId);
    }

    if (new Set(imageIds).size !== imageIds.length) {
      throw new UnprocessableEntityException('Duplicate image id found in reorder payload');
    }
    if (images.length !== imageIds.length) {
      throw new UnprocessableEntityException('imageIds must contain all existing product image ids');
    }

    const imageSet = new Set(images.map((image) => image.id));
    for (const imageId of imageIds) {
      if (!imageSet.has(imageId)) {
        throw new UnprocessableEntityException(`Invalid image id in reorder payload: ${imageId}`);
      }
    }

    await this.prisma.$transaction(
      imageIds.map((imageId, index) =>
        this.prisma.productImage.update({
          where: { id: imageId },
          data: { sortOrder: index + 1 },
        }),
      ),
    );

    const updated = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    return updated.map((image) => ProductImageResponseDto.from(image));
  }

  private validateImageFile(file: UploadedBinaryFile): void {
    if (!file || !file.buffer || file.size <= 0) {
      throw new UnprocessableEntityException('Image file is empty');
    }
    if (file.size > ProductService.MAX_IMAGE_SIZE_BYTES) {
      throw new UnprocessableEntityException('Image size exceeds 5MB');
    }

    const contentType = file.mimetype?.toLowerCase();
    if (!contentType || !ProductService.ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new UnprocessableEntityException('Only JPG, PNG, WebP are supported');
    }
  }

  private buildImageObjectKey(tenantId: string, productId: string, originalFilename?: string): string {
    const safeFileName = (originalFilename || 'image')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-');

    return `products/${tenantId}/${productId}/${randomUUID()}-${safeFileName}`;
  }
}
