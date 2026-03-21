import { Injectable } from '@nestjs/common';
import { InvoiceStatus, MessageStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DashboardOverviewDto,
  DashboardRecentInvoiceDto,
  DashboardRecentMessageDto,
  DashboardRevenuePointDto,
  DashboardTaskDistributionDto,
} from './dto/dashboard-overview.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(tenantId: string, userId: string): Promise<DashboardOverviewDto> {
    const sixMonthsAgo = this.startOfMonthOffset(-5);

    const [
      totalUsers,
      totalProducts,
      totalBoards,
      totalTasks,
      totalInvoices,
      overdueInvoices,
      unreadMessages,
      paidInvoices,
      recentInvoices,
      recentMessages,
      taskDistribution,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { tenantId, isActive: true } }),
      this.prisma.product.count({ where: { tenantId } }),
      this.prisma.board.count({ where: { tenantId } }),
      this.prisma.task.count({ where: { column: { board: { tenantId } } } }),
      this.prisma.invoice.count({ where: { tenantId } }),
      this.prisma.invoice.count({ where: { tenantId, status: InvoiceStatus.OVERDUE } }),
      this.prisma.message.count({
        where: {
          tenantId,
          receiverId: userId,
          status: MessageStatus.UNREAD,
        },
      }),
      this.prisma.invoice.findMany({
        where: {
          tenantId,
          status: InvoiceStatus.PAID,
          issueDate: { gte: sixMonthsAgo },
        },
        select: { total: true, issueDate: true },
      }),
      this.prisma.invoice.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          clientName: true,
          total: true,
          issueDate: true,
          dueDate: true,
        },
      }),
      this.prisma.message.findMany({
        where: {
          tenantId,
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: { select: { firstName: true, lastName: true } },
          receiver: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.boardColumn.findMany({
        where: { board: { tenantId } },
        include: {
          board: { select: { id: true, name: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: [{ boardId: 'asc' }, { sortOrder: 'asc' }],
      }),
    ]);

    const paidRevenueTotal = paidInvoices.reduce((sum, item) => sum + Number(item.total), 0);

    const revenueLast6Months = this.buildRevenueTrend(paidInvoices);

    const mappedRecentInvoices: DashboardRecentInvoiceDto[] = recentInvoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      clientName: invoice.clientName,
      total: Number(invoice.total),
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
    }));

    const mappedRecentMessages: DashboardRecentMessageDto[] = recentMessages.map((message) => ({
      id: message.id,
      subject: message.subject,
      status: message.status,
      senderName: `${message.sender.firstName} ${message.sender.lastName}`.trim(),
      receiverName: `${message.receiver.firstName} ${message.receiver.lastName}`.trim(),
      createdAt: message.createdAt.toISOString(),
    }));

    const mappedTaskDistribution: DashboardTaskDistributionDto[] = taskDistribution.map((column) => ({
      boardId: column.board.id,
      boardName: column.board.name,
      columnId: column.id,
      columnName: column.name,
      taskCount: column._count.tasks,
    }));

    return {
      kpi: {
        totalUsers,
        totalProducts,
        totalBoards,
        totalTasks,
        totalInvoices,
        overdueInvoices,
        unreadMessages,
        paidRevenueTotal,
      },
      revenueLast6Months,
      taskDistribution: mappedTaskDistribution,
      recentInvoices: mappedRecentInvoices,
      recentMessages: mappedRecentMessages,
    };
  }

  private buildRevenueTrend(items: Array<{ total: unknown; issueDate: Date }>): DashboardRevenuePointDto[] {
    const months = this.lastMonths(6);
    const bucket = new Map<string, number>(months.map((month) => [month, 0]));

    for (const item of items) {
      const key = this.monthKey(item.issueDate);
      if (!bucket.has(key)) {
        continue;
      }
      bucket.set(key, (bucket.get(key) ?? 0) + Number(item.total));
    }

    return months.map((month) => ({
      month,
      amount: bucket.get(month) ?? 0,
    }));
  }

  private lastMonths(count: number): string[] {
    const now = new Date();
    const months: string[] = [];

    for (let i = count - 1; i >= 0; i -= 1) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      months.push(this.monthKey(date));
    }

    return months;
  }

  private monthKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  private startOfMonthOffset(monthOffset: number): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1));
  }
}
