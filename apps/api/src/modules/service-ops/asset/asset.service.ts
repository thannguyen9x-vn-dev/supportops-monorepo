import { Injectable, Logger } from '@nestjs/common';
import { AssetStatus, Prisma } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestResponseDto } from '../request/dto/request-response.dto';
import { AssetDetailQueryDto } from './dto/asset-detail-query.dto';
import { AssetDetailResponseDto } from './dto/asset-detail-response.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { AssetResponseDto } from './dto/asset-response.dto';
import { AssetTypeResponseDto } from './dto/asset-type-response.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Asset Types ─────────────────────────────────────────────────────────────

  async listAssetTypes(tenantId: string): Promise<AssetTypeResponseDto[]> {
    const items = await this.prisma.assetType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
    return items.map(AssetTypeResponseDto.from);
  }

  async createAssetType(tenantId: string, dto: CreateAssetTypeDto): Promise<AssetTypeResponseDto> {
    const name = dto.name.trim();
    const existing = await this.prisma.assetType.findFirst({
      where: { tenantId, name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('ASSET_TYPE_NAME_EXISTS', `Asset type name already exists: ${name}`);
    }

    const created = await this.prisma.assetType.create({
      data: {
        tenantId,
        name,
        category: dto.category?.trim() || null,
        description: dto.description?.trim() || null,
      },
    });

    this.logger.log(`Asset type created: id=${created.id}, tenantId=${tenantId}`);
    return AssetTypeResponseDto.from(created);
  }

  async updateAssetType(tenantId: string, id: string, dto: UpdateAssetTypeDto): Promise<AssetTypeResponseDto> {
    const existing = await this.prisma.assetType.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('AssetType', id);
    }

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const duplicate = await this.prisma.assetType.findFirst({
        where: { tenantId, name: { equals: name, mode: 'insensitive' }, id: { not: id } },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException('ASSET_TYPE_NAME_EXISTS', `Asset type name already exists: ${name}`);
      }
    }

    const updated = await this.prisma.assetType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.category !== undefined && { category: dto.category?.trim() || null }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
      },
    });

    this.logger.log(`Asset type updated: id=${id}, tenantId=${tenantId}`);
    return AssetTypeResponseDto.from(updated);
  }

  async deleteAssetType(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.assetType.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('AssetType', id);
    }

    const linkedCount = await this.prisma.asset.count({ where: { tenantId, assetTypeId: id } });
    if (linkedCount > 0) {
      throw new ConflictException(
        'ASSET_TYPE_IN_USE',
        `Cannot delete asset type because it is linked to ${linkedCount} asset(s)`,
      );
    }

    await this.prisma.assetType.delete({ where: { id } });
    this.logger.log(`Asset type deleted: id=${id}, tenantId=${tenantId}`);
  }

  // ─── Assets ──────────────────────────────────────────────────────────────────

  async list(
    tenantId: string,
    query: AssetQueryDto,
  ): Promise<{ data: AssetResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;

    const where: Prisma.AssetWhereInput = {
      tenantId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { assetCode: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.assetTypeId ? { assetTypeId: query.assetTypeId } : {}),
      ...(query.locationId ? { locationId: query.locationId } : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.asset.count({ where }),
      this.prisma.asset.findMany({
        where,
        include: { assetType: true },
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * size,
        take: size,
      }),
    ]);

    return {
      data: items.map(AssetResponseDto.from),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async getById(tenantId: string, id: string): Promise<AssetResponseDto> {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      include: { assetType: true },
    });
    if (!asset) {
      throw new NotFoundException('Asset', id);
    }
    return AssetResponseDto.from(asset);
  }

  async detail(
    tenantId: string,
    assetId: string,
    query: AssetDetailQueryDto,
  ): Promise<AssetDetailResponseDto> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, tenantId },
      include: { assetType: true },
    });
    if (!asset) {
      throw new NotFoundException('Asset', assetId);
    }

    const requestWhere: Prisma.ServiceRequestWhereInput = {
      tenantId,
      assetId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [requests, total, openCount] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where: requestWhere,
        include: {
          serviceType: { select: { code: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.serviceRequest.count({ where: requestWhere }),
      this.prisma.serviceRequest.count({
        where: {
          tenantId,
          assetId,
          status: {
            notIn: [
              'CLOSED' as const,
              'CANCELLED' as const,
            ],
          },
        },
      }),
    ]);

    return {
      asset: AssetResponseDto.from(asset),
      openRequestCount: openCount,
      requests: requests.map((item) => RequestResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async create(tenantId: string, dto: CreateAssetDto): Promise<AssetResponseDto> {
    const assetCode = dto.assetCode.trim().toUpperCase();

    await this.assertAssetTypeExists(tenantId, dto.assetTypeId);

    const existing = await this.prisma.asset.findFirst({
      where: { tenantId, assetCode },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('ASSET_CODE_EXISTS', `Asset code already exists: ${assetCode}`);
    }

    const created = await this.prisma.asset.create({
      data: {
        tenantId,
        assetCode,
        name: dto.name.trim(),
        assetTypeId: dto.assetTypeId,
        locationId: dto.locationId.trim(),
        status: dto.status ?? AssetStatus.ACTIVE,
        serialNumber: dto.serialNumber?.trim() || null,
        model: dto.model?.trim() || null,
        assignedDepartment: dto.assignedDepartment?.trim() || null,
        responsibleTeam: dto.responsibleTeam?.trim() || null,
        installedAt: dto.installedAt ? new Date(dto.installedAt) : null,
        description: dto.description?.trim() || null,
      },
      include: { assetType: true },
    });

    this.logger.log(`Asset created: id=${created.id}, tenantId=${tenantId}`);
    return AssetResponseDto.from(created);
  }

  async update(tenantId: string, id: string, dto: UpdateAssetDto): Promise<AssetResponseDto> {
    const existing = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      select: { id: true, assetCode: true },
    });
    if (!existing) {
      throw new NotFoundException('Asset', id);
    }

    if (dto.assetTypeId) {
      await this.assertAssetTypeExists(tenantId, dto.assetTypeId);
    }

    if (dto.assetCode !== undefined) {
      const nextCode = dto.assetCode.trim().toUpperCase();
      const duplicate = await this.prisma.asset.findFirst({
        where: { tenantId, assetCode: nextCode, id: { not: id } },
        select: { id: true },
      });
      if (duplicate) {
        throw new ConflictException('ASSET_CODE_EXISTS', `Asset code already exists: ${nextCode}`);
      }
    }

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        ...(dto.assetCode !== undefined && { assetCode: dto.assetCode.trim().toUpperCase() }),
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.assetTypeId !== undefined && { assetTypeId: dto.assetTypeId }),
        ...(dto.locationId !== undefined && { locationId: dto.locationId.trim() }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.serialNumber !== undefined && { serialNumber: dto.serialNumber?.trim() || null }),
        ...(dto.model !== undefined && { model: dto.model?.trim() || null }),
        ...(dto.assignedDepartment !== undefined && {
          assignedDepartment: dto.assignedDepartment?.trim() || null,
        }),
        ...(dto.responsibleTeam !== undefined && { responsibleTeam: dto.responsibleTeam?.trim() || null }),
        ...(dto.installedAt !== undefined && {
          installedAt: dto.installedAt ? new Date(dto.installedAt) : null,
        }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
      },
      include: { assetType: true },
    });

    this.logger.log(`Asset updated: id=${id}, tenantId=${tenantId}`);
    return AssetResponseDto.from(updated);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Asset', id);
    }

    // Unlink requests before deleting (SetNull via FK handles it, but let's be explicit)
    await this.prisma.asset.delete({ where: { id } });
    this.logger.log(`Asset deleted: id=${id}, tenantId=${tenantId}`);
  }

  private async assertAssetTypeExists(tenantId: string, assetTypeId: string): Promise<void> {
    const assetType = await this.prisma.assetType.findFirst({
      where: { id: assetTypeId, tenantId },
      select: { id: true },
    });
    if (!assetType) {
      throw new NotFoundException('AssetType', assetTypeId);
    }
  }
}
