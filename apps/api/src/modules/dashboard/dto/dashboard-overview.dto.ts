import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus, MessageStatus } from '@prisma/client';

export class DashboardKpiDto {
  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  totalProducts!: number;

  @ApiProperty()
  totalBoards!: number;

  @ApiProperty()
  totalTasks!: number;

  @ApiProperty()
  totalInvoices!: number;

  @ApiProperty()
  overdueInvoices!: number;

  @ApiProperty()
  unreadMessages!: number;

  @ApiProperty()
  paidRevenueTotal!: number;
}

export class DashboardRevenuePointDto {
  @ApiProperty({ example: '2026-03' })
  month!: string;

  @ApiProperty({ example: 12450.75 })
  amount!: number;
}

export class DashboardTaskDistributionDto {
  @ApiProperty()
  boardId!: string;

  @ApiProperty()
  boardName!: string;

  @ApiProperty()
  columnId!: string;

  @ApiProperty()
  columnName!: string;

  @ApiProperty()
  taskCount!: number;
}

export class DashboardRecentInvoiceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceNumber!: string;

  @ApiProperty({ enum: InvoiceStatus })
  status!: InvoiceStatus;

  @ApiProperty()
  clientName!: string;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  issueDate!: string;

  @ApiProperty()
  dueDate!: string;
}

export class DashboardRecentMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty({ enum: MessageStatus })
  status!: MessageStatus;

  @ApiProperty()
  senderName!: string;

  @ApiProperty()
  receiverName!: string;

  @ApiProperty()
  createdAt!: string;
}

export class DashboardOverviewDto {
  @ApiProperty({ type: DashboardKpiDto })
  kpi!: DashboardKpiDto;

  @ApiProperty({ type: [DashboardRevenuePointDto] })
  revenueLast6Months!: DashboardRevenuePointDto[];

  @ApiProperty({ type: [DashboardTaskDistributionDto] })
  taskDistribution!: DashboardTaskDistributionDto[];

  @ApiProperty({ type: [DashboardRecentInvoiceDto] })
  recentInvoices!: DashboardRecentInvoiceDto[];

  @ApiProperty({ type: [DashboardRecentMessageDto] })
  recentMessages!: DashboardRecentMessageDto[];
}
