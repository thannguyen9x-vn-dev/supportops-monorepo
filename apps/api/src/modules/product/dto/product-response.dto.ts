import { ApiProperty } from '@nestjs/swagger';
import { Product, ProductImage } from '@prisma/client';

export class ProductImageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  sortOrder!: number;

  static from(image: ProductImage): ProductImageResponseDto {
    return {
      id: image.id,
      url: image.url,
      sortOrder: image.sortOrder,
    };
  }
}

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  subtitle!: string | null;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  brand!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({ nullable: true })
  details!: string | null;

  @ApiProperty({ type: [ProductImageResponseDto] })
  images!: ProductImageResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(product: Product & { images?: ProductImage[] }): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      brand: product.brand,
      price: Number(product.price),
      details: product.details,
      images: product.images?.map((image) => ProductImageResponseDto.from(image)) ?? [],
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
