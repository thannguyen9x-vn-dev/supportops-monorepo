import { ApiProperty } from '@nestjs/swagger';
import { BillingInfo, PaymentMethod } from '@prisma/client';

export class BillingInfoResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ nullable: true })
  companyName!: string | null;

  @ApiProperty({ nullable: true })
  vatNumber!: string | null;

  @ApiProperty({ nullable: true })
  address!: string | null;

  @ApiProperty({ nullable: true })
  city!: string | null;

  @ApiProperty({ nullable: true })
  state!: string | null;

  @ApiProperty({ nullable: true })
  zipCode!: string | null;

  @ApiProperty({ nullable: true })
  country!: string | null;

  @ApiProperty({ nullable: true })
  email!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(info: BillingInfo): BillingInfoResponseDto {
    return {
      id: info.id,
      tenantId: info.tenantId,
      companyName: info.companyName,
      vatNumber: info.vatNumber,
      address: info.address,
      city: info.city,
      state: info.state,
      zipCode: info.zipCode,
      country: info.country,
      email: info.email,
      createdAt: info.createdAt.toISOString(),
      updatedAt: info.updatedAt.toISOString(),
    };
  }
}

export class PaymentMethodResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  last4!: string;

  @ApiProperty({ nullable: true })
  brand!: string | null;

  @ApiProperty({ nullable: true })
  expiryMonth!: number | null;

  @ApiProperty({ nullable: true })
  expiryYear!: number | null;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  createdAt!: string;

  static from(method: PaymentMethod): PaymentMethodResponseDto {
    return {
      id: method.id,
      tenantId: method.tenantId,
      type: method.type,
      last4: method.last4,
      brand: method.brand,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.isDefault,
      createdAt: method.createdAt.toISOString(),
    };
  }
}
