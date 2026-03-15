import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AvatarUploadResponseDto } from './dto/avatar-upload-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UserPreferencesResponseDto } from './dto/user-preferences-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  private static readonly MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
  private static readonly ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  async getMe(tenantId: string, userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User', userId);
    }

    return UserResponseDto.from(user);
  }

  async updateMe(tenantId: string, userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User', userId);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.birthday !== undefined && { birthday: dto.birthday }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.organization !== undefined && { organization: dto.organization }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.locale !== undefined && { locale: dto.locale }),
      },
    });

    if (!updated.firstName?.trim() || !updated.lastName?.trim()) {
      throw new UnprocessableEntityException('First name and last name are required');
    }

    return UserResponseDto.from(updated);
  }

  async changePassword(tenantId: string, userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User', userId);
    }

    const matches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!matches) {
      throw new UnprocessableEntityException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getPreferences(tenantId: string, userId: string): Promise<UserPreferencesResponseDto> {
    const preference = await this.getOrCreatePreference(tenantId, userId);
    return UserPreferencesResponseDto.from(preference);
  }

  async updatePreferences(
    tenantId: string,
    userId: string,
    dto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    const preference = await this.getOrCreatePreference(tenantId, userId);

    const savedPreference = await this.prisma.userPreference.update({
      where: { id: preference.id },
      data: {
        ...(dto.companyNews !== undefined && { companyNews: dto.companyNews }),
        ...(dto.accountActivity !== undefined && { accountActivity: dto.accountActivity }),
        ...(dto.meetupsNearYou !== undefined && { meetupsNearYou: dto.meetupsNearYou }),
        ...(dto.newMessages !== undefined && { newMessages: dto.newMessages }),
        ...(dto.ratingReminders !== undefined && { ratingReminders: dto.ratingReminders }),
        ...(dto.itemUpdateNotif !== undefined && { itemUpdateNotif: dto.itemUpdateNotif }),
        ...(dto.itemCommentNotif !== undefined && { itemCommentNotif: dto.itemCommentNotif }),
        ...(dto.buyerReviewNotif !== undefined && { buyerReviewNotif: dto.buyerReviewNotif }),
      },
    });

    return UserPreferencesResponseDto.from(savedPreference);
  }

  async uploadAvatar(tenantId: string, userId: string, file?: UploadedBinaryFile): Promise<AvatarUploadResponseDto> {
    if (!file || !file.buffer || file.size <= 0) {
      throw new UnprocessableEntityException('Avatar file is required');
    }
    if (file.size > UserService.MAX_AVATAR_SIZE_BYTES) {
      throw new UnprocessableEntityException('Avatar file size exceeds 2 MB');
    }

    const contentType = file.mimetype?.toLowerCase();
    if (!contentType || !UserService.ALLOWED_AVATAR_TYPES.has(contentType)) {
      throw new UnprocessableEntityException('Only JPG, PNG, WEBP are supported');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User', userId);
    }

    const objectKey = this.buildAvatarObjectKey(tenantId, userId, file.originalname);
    const url = await this.objectStorageService.uploadPublicObject(objectKey, file.buffer);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url },
    });

    if (user.avatarUrl && user.avatarUrl !== url) {
      await this.objectStorageService.deleteObjectByUrl(user.avatarUrl);
    }

    return { url };
  }

  private async getOrCreatePreference(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User', userId);
    }

    const existingPreference = await this.prisma.userPreference.findUnique({
      where: { userId },
    });
    if (existingPreference) {
      return existingPreference;
    }

    return this.prisma.userPreference.create({
      data: {
        userId,
        tenantId,
      },
    });
  }

  private buildAvatarObjectKey(tenantId: string, userId: string, originalFilename?: string): string {
    const safeFileName = (originalFilename || 'avatar')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-');

    return `avatars/${tenantId}/${userId}/${randomUUID()}-${safeFileName}`;
  }
}
