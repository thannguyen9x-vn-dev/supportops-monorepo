import { ApiProperty } from '@nestjs/swagger';
import { Invoice, InvoiceItem, InvoiceStatus } from '@prisma/client';

type InvoiceModel = Invoice & { items?: InvoiceItem[] };

export class InvoiceItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  sortOrder!: number;

  static from(item: InvoiceItem): InvoiceItemResponseDto {
    return {
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      sortOrder: item.sortOrder,
    };
  }
}

export class InvoiceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  invoiceNumber!: string;

  @ApiProperty({ enum: InvoiceStatus })
  status!: InvoiceStatus;

  @ApiProperty()
  issueDate!: string;

  @ApiProperty()
  dueDate!: string;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  taxRate!: number;

  @ApiProperty()
  taxAmount!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  clientName!: string;

  @ApiProperty({ nullable: true })
  clientEmail!: string | null;

  @ApiProperty({ nullable: true })
  clientAddress!: string | null;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items!: InvoiceItemResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(invoice: InvoiceModel): InvoiceResponseDto {
    return {
      id: invoice.id,
      tenantId: invoice.tenantId,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      subtotal: Number(invoice.subtotal),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      notes: invoice.notes,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      items: (invoice.items ?? []).map((item) => InvoiceItemResponseDto.from(item)),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }
}
