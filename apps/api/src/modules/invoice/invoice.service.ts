import { Injectable, Logger } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../common/dto/page-meta.dto';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, CreateInvoiceItemDto } from './dto/create-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: InvoiceQueryDto): Promise<{ data: InvoiceResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.InvoiceWhereInput = {
      tenantId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
              { clientName: { contains: query.search, mode: 'insensitive' } },
              { clientEmail: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: items.map((item) => InvoiceResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async getById(tenantId: string, id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice', id);
    }

    return InvoiceResponseDto.from(invoice);
  }

  async create(tenantId: string, dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const normalizedItems = this.normalizeItems(dto.items);
    const totals = this.calculateTotals(normalizedItems, dto.taxRate ?? 0);

    try {
      const invoice = await this.prisma.invoice.create({
        data: {
          tenantId,
          invoiceNumber: dto.invoiceNumber,
          status: dto.status ?? InvoiceStatus.DRAFT,
          issueDate: dto.issueDate,
          dueDate: dto.dueDate,
          subtotal: totals.subtotal,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          notes: dto.notes,
          clientName: dto.clientName,
          clientEmail: dto.clientEmail,
          clientAddress: dto.clientAddress,
          items: {
            create: normalizedItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              sortOrder: item.sortOrder,
            })),
          },
        },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      this.logger.log(`Invoice created: id=${invoice.id}, tenantId=${tenantId}`);
      return InvoiceResponseDto.from(invoice);
    } catch (error) {
      if (this.isUniqueError(error)) {
        throw new ConflictException('INVOICE_NUMBER_ALREADY_EXISTS', `Invoice number already exists: ${dto.invoiceNumber}`);
      }
      throw error;
    }
  }

  async update(tenantId: string, id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const existing = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!existing) {
      throw new NotFoundException('Invoice', id);
    }

    const normalizedItems =
      dto.items !== undefined
        ? this.normalizeItems(dto.items)
        : existing.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
            sortOrder: item.sortOrder,
          }));

    const totals = this.calculateTotals(normalizedItems, dto.taxRate ?? Number(existing.taxRate));

    try {
      const invoice = await this.prisma.invoice.update({
        where: { id },
        data: {
          ...(dto.invoiceNumber !== undefined && { invoiceNumber: dto.invoiceNumber }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.issueDate !== undefined && { issueDate: dto.issueDate }),
          ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
          subtotal: totals.subtotal,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.clientName !== undefined && { clientName: dto.clientName }),
          ...(dto.clientEmail !== undefined && { clientEmail: dto.clientEmail }),
          ...(dto.clientAddress !== undefined && { clientAddress: dto.clientAddress }),
          ...(dto.items !== undefined && {
            items: {
              deleteMany: {},
              create: normalizedItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                sortOrder: item.sortOrder,
              })),
            },
          }),
        },
        include: {
          items: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      this.logger.log(`Invoice updated: id=${id}, tenantId=${tenantId}`);
      return InvoiceResponseDto.from(invoice);
    } catch (error) {
      if (this.isUniqueError(error)) {
        throw new ConflictException(
          'INVOICE_NUMBER_ALREADY_EXISTS',
          `Invoice number already exists: ${dto.invoiceNumber ?? existing.invoiceNumber}`,
        );
      }
      throw error;
    }
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Invoice', id);
    }

    await this.prisma.invoice.delete({ where: { id } });
    this.logger.log(`Invoice deleted: id=${id}, tenantId=${tenantId}`);
  }

  private normalizeItems(items: CreateInvoiceItemDto[]): Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    sortOrder: number;
  }> {
    return items.map((item, index) => {
      const quantity = item.quantity;
      const unitPrice = Number(item.unitPrice);
      const total = this.roundToTwo(quantity * unitPrice);

      return {
        description: item.description,
        quantity,
        unitPrice,
        total,
        sortOrder: item.sortOrder ?? index,
      };
    });
  }

  private calculateTotals(
    items: Array<{ total: number }>,
    taxRateInput: number,
  ): { subtotal: number; taxRate: number; taxAmount: number; total: number } {
    const subtotal = this.roundToTwo(items.reduce((sum, item) => sum + item.total, 0));
    const taxRate = this.roundToTwo(taxRateInput);
    const taxAmount = this.roundToTwo((subtotal * taxRate) / 100);
    const total = this.roundToTwo(subtotal + taxAmount);

    return { subtotal, taxRate, taxAmount, total };
  }

  private isUniqueError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }

  private roundToTwo(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
