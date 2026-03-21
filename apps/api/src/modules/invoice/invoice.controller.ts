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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices (paginated)' })
  list(@CurrentTenant() tenantId: string, @Query() query: InvoiceQueryDto) {
    return this.invoiceService.list(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  getById(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<InvoiceResponseDto> {
    return this.invoiceService.getById(tenantId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions({ all: ['invoice.manage'] })
  @ApiOperation({ summary: 'Create invoice' })
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoiceService.create(tenantId, dto);
  }

  @Put(':id')
  @Permissions({ all: ['invoice.manage'] })
  @ApiOperation({ summary: 'Update invoice' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoiceService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['invoice.manage'] })
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.invoiceService.delete(tenantId, id);
  }
}
