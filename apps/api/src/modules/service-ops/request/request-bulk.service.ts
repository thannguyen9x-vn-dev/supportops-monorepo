import { Injectable } from '@nestjs/common';
import { Prisma, RequestStatus, SourceChannel, UserStatus } from '@prisma/client';
import type { BulkCreateRequestResult } from '@supportops/types';
import { AppException } from '../../../common/exceptions/app.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { BulkCreateRequestDto, BulkCreateRequestItemDto } from './dto/bulk-create-request.dto';

interface BulkCreateValidationError {
  index: number;
  field?: string;
  message: string;
}

@Injectable()
export class RequestBulkService {
  constructor(private readonly prisma: PrismaService) {}

  async bulkCreate(
    tenantId: string,
    userId: string,
    dto: BulkCreateRequestDto,
  ): Promise<BulkCreateRequestResult> {
    if (dto.items.length > 100) {
      throw new AppException(400, 'BULK_ITEMS_LIMIT_EXCEEDED', 'Maximum 100 items per bulk request');
    }

    const serviceTypeCodes = [...new Set(dto.items.map((item) => item.serviceTypeCode))];
    const reporterEmails = [
      ...new Set(
        dto.items
          .map((item) => item.reporterEmail?.trim().toLowerCase())
          .filter((email): email is string => Boolean(email)),
      ),
    ];

    const [serviceTypes, reporters] = await Promise.all([
      serviceTypeCodes.length > 0
        ? this.prisma.serviceType.findMany({
            where: {
              tenantId,
              code: { in: serviceTypeCodes },
              isActive: true,
            },
            select: { id: true, code: true },
          })
        : Promise.resolve([]),
      reporterEmails.length > 0
        ? this.prisma.user.findMany({
            where: {
              tenantId,
              email: { in: reporterEmails },
              status: UserStatus.ACTIVE,
            },
            select: { id: true, email: true },
          })
        : Promise.resolve([]),
    ]);

    const serviceTypeMap = new Map(serviceTypes.map((serviceType) => [serviceType.code, serviceType.id]));
    const reporterMap = new Map(reporters.map((reporter) => [reporter.email.toLowerCase(), reporter.id]));

    const errors: BulkCreateValidationError[] = [];
    const validItems: Array<{ item: BulkCreateRequestItemDto; index: number }> = [];
    const seenDedup = new Set<string>();

    dto.items.forEach((item, index) => {
      const duplicateKey = this.buildDuplicateKey(item.title, item.serviceTypeCode, item.reporterEmail);
      if (seenDedup.has(duplicateKey)) {
        errors.push({ index, field: 'title', message: 'Duplicate row within this payload' });
        return;
      }
      seenDedup.add(duplicateKey);

      if (!serviceTypeMap.has(item.serviceTypeCode)) {
        errors.push({
          index,
          field: 'serviceTypeCode',
          message: `serviceTypeCode '${item.serviceTypeCode}' does not exist in tenant`,
        });
        return;
      }

      if (item.reporterEmail && !reporterMap.has(item.reporterEmail.toLowerCase())) {
        errors.push({
          index,
          field: 'reporterEmail',
          message: `reporterEmail '${item.reporterEmail}' is not a member of this tenant`,
        });
        return;
      }

      validItems.push({ item, index });
    });

    if (validItems.length > 0) {
      await this.prisma.$transaction(
        validItems.map(({ item }) =>
          this.prisma.serviceRequest.create({
            data: {
              tenantId,
              title: item.title.trim(),
              description: item.description?.trim() ?? '',
              serviceTypeId: serviceTypeMap.get(item.serviceTypeCode)!,
              priority: item.priority,
              locationId: item.locationId.trim(),
              requesterId: item.reporterEmail ? reporterMap.get(item.reporterEmail.toLowerCase())! : userId,
              status: RequestStatus.SUBMITTED,
              sourceChannel: SourceChannel.API,
            },
          }),
        ),
      );
    }

    const result: BulkCreateRequestResult = {
      created: validItems.length,
      failed: dto.items.length - validItems.length,
      errors,
    };

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        entityType: 'BulkImportJob',
        entityId: `bulk-${Date.now()}`,
        action: 'BULK_IMPORT_COMPLETED',
        actorId: userId,
        afterData: result as unknown as Prisma.InputJsonValue,
      },
    });

    return result;
  }

  private buildDuplicateKey(title: string, serviceTypeCode: string, reporterEmail?: string): string {
    return `${title.trim().toLowerCase()}::${serviceTypeCode.trim().toLowerCase()}::${(reporterEmail ?? '').trim().toLowerCase()}`;
  }
}
