import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MembershipStatus, Prisma, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { ForbiddenException } from '../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ObjectStorageService } from '../../common/storage/object-storage.service';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthMailService } from '../auth/auth-mail.service';
import { AvatarUploadResponseDto } from './dto/avatar-upload-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InviteTenantUserDto } from './dto/invite-tenant-user.dto';
import { InviteTenantUserResponseDto } from './dto/invite-tenant-user-response.dto';
import { TenantUserResponseDto } from './dto/tenant-user-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UserSessionResponseDto } from './dto/user-session-response.dto';
import { UserPreferencesResponseDto } from './dto/user-preferences-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  private static readonly MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
  private static readonly ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly authMailService: AuthMailService,
    private readonly configService: ConfigService,
  ) {}

  private normalizeBirthdayInput(rawBirthday: string | undefined): Date | null | undefined {
    if (rawBirthday === undefined) {
      return undefined;
    }

    const trimmed = rawBirthday.trim();
    if (!trimmed) {
      return null;
    }

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1]);
      const month = Number(dateOnlyMatch[2]);
      const day = Number(dateOnlyMatch[3]);
      const parsed = new Date(Date.UTC(year, month - 1, day));
      if (
        parsed.getUTCFullYear() !== year ||
        parsed.getUTCMonth() !== month - 1 ||
        parsed.getUTCDate() !== day
      ) {
        throw new UnprocessableEntityException('Birthday is invalid');
      }
      return parsed;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new UnprocessableEntityException('Birthday must be a valid date');
    }
    return parsed;
  }

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

    const membership = await this.resolveActiveMembershipSummary(user.id, tenantId);
    const roleCode = this.resolveRoleCodeWithFallback(membership?.roleCode, user.role);
    return UserResponseDto.from(user, roleCode, membership?.joinedAt ?? null);
  }

  async listTenantUsers(tenantId: string): Promise<TenantUserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      include: {
        memberships: {
          where: { tenantId },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => {
      const membership = user.memberships[0] ?? null;
      return {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        fullName: user.fullName?.trim() || `${user.firstName} ${user.lastName}`.trim(),
        department: user.department,
        userStatus: user.status,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        membershipId: membership?.id ?? null,
        roleCode: membership?.roleCode ?? null,
        membershipStatus: membership?.status ?? null,
        createdAt: user.createdAt.toISOString(),
      };
    });
  }

  async listMySessions(tenantId: string, userId: string, currentTokenHash?: string): Promise<UserSessionResponseDto[]> {
    const sessions = await this.prisma.refreshSession.findMany({
      where: {
        tenantId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent ?? null,
      ipAddress: session.ipAddress ?? null,
      createdAt: session.createdAt.toISOString(),
      lastUsedAt: session.lastUsedAt?.toISOString() ?? null,
      expiresAt: session.expiresAt.toISOString(),
      revokedAt: session.revokedAt?.toISOString() ?? null,
      revokedReason: session.revokedReason ?? null,
      isCurrent: !!currentTokenHash && session.tokenHash === currentTokenHash,
    }));
  }

  async inviteTenantUser(
    tenantId: string,
    actorUserId: string,
    dto: InviteTenantUserDto,
  ): Promise<InviteTenantUserResponseDto> {
    const now = new Date();
    const email = dto.email.trim().toLowerCase();
    const inviteTtlHours = 48;
    const expiresAt = new Date(now.getTime() + inviteTtlHours * 60 * 60 * 1000);
    const rawInviteToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawInviteToken).digest('hex');

    const invited = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          tenantId: true,
        },
      });

      let targetUserId: string;
      if (existingUser) {
        if (existingUser.tenantId !== tenantId) {
          throw new UnprocessableEntityException('Email already belongs to another tenant');
        }
        targetUserId = existingUser.id;
      } else {
        const fullName = dto.fullName?.trim() || 'Invited User';
        const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);
        const lastName = rest.join(' ') || 'User';
        const tempPasswordHash = await bcrypt.hash(randomUUID(), 12);
        const createdUser = await tx.user.create({
          data: {
            tenantId,
            email,
            firstName: firstName || 'Invited',
            lastName,
            fullName,
            passwordHash: tempPasswordHash,
            isEmailVerified: false,
            status: UserStatus.PENDING,
            isActive: false,
          },
          select: {
            id: true,
          },
        });
        targetUserId = createdUser.id;
      }

      const existingMembership = await tx.membership.findUnique({
        where: {
          tenantId_userId: {
            tenantId,
            userId: targetUserId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (existingMembership?.status === MembershipStatus.ACTIVE) {
        throw new UnprocessableEntityException('User is already active in this tenant');
      }

      if (existingMembership) {
        await tx.membership.update({
          where: { id: existingMembership.id },
          data: {
            roleCode: dto.roleCode,
            status: MembershipStatus.INVITED,
            invitedAt: now,
          },
        });
      } else {
        await tx.membership.create({
          data: {
            tenantId,
            userId: targetUserId,
            roleCode: dto.roleCode,
            status: MembershipStatus.INVITED,
            invitedAt: now,
            invitedById: actorUserId,
          },
        });
      }

      const invite = await tx.invite.create({
        data: {
          tenantId,
          email,
          roleCode: dto.roleCode,
          tokenHash,
          expiresAt,
          invitedByUserId: actorUserId,
        },
        select: {
          id: true,
          expiresAt: true,
          roleCode: true,
          tenant: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        targetUserId,
        invite,
      };
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        entityType: 'USER',
        entityId: invited.targetUserId,
        action: 'USER_INVITED',
        actorId: actorUserId,
        beforeData: Prisma.JsonNull,
        afterData: {
          email,
          roleCode: dto.roleCode,
          inviteId: invited.invite.id,
        },
      },
    });

    const acceptInviteUrl = this.buildAcceptInviteUrl(rawInviteToken);
    await this.authMailService.sendInviteEmail(
      email,
      acceptInviteUrl,
      invited.invite.tenant.name,
      invited.invite.roleCode,
      invited.targetUserId,
      tenantId,
    );

    return {
      inviteId: invited.invite.id,
      expiresAt: invited.invite.expiresAt.toISOString(),
    };
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

    const currentMembership = await this.resolveActiveMembershipSummary(user.id, tenantId);
    const currentRoleCode = this.resolveRoleCodeWithFallback(currentMembership?.roleCode, user.role);
    const canUpdateDepartment =
      currentRoleCode === 'TENANT_ADMIN' || user.role === Role.SUPER_ADMIN;

    if (dto.department !== undefined && !canUpdateDepartment) {
      throw new ForbiddenException('Only admin roles can update department');
    }

    const normalizedBirthday = this.normalizeBirthdayInput(dto.birthday);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(normalizedBirthday !== undefined && { birthday: normalizedBirthday }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.organization !== undefined && { organization: dto.organization }),
        ...(dto.department !== undefined && canUpdateDepartment && { department: dto.department }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.locale !== undefined && { locale: dto.locale }),
      },
    });

    if (!updated.firstName?.trim() || !updated.lastName?.trim()) {
      throw new UnprocessableEntityException('First name and last name are required');
    }

    const updatedMembership = await this.resolveActiveMembershipSummary(updated.id, tenantId);
    const roleCode = this.resolveRoleCodeWithFallback(updatedMembership?.roleCode, updated.role);
    return UserResponseDto.from(updated, roleCode, updatedMembership?.joinedAt ?? null);
  }

  async changePassword(tenantId: string, userId: string, dto: ChangePasswordDto): Promise<void> {
    if (dto.currentPassword === dto.newPassword) {
      throw new UnprocessableEntityException('New password must be different from current password');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new UnprocessableEntityException('Passwords do not match');
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
        ...(dto.assignmentAlerts !== undefined && { assignmentAlerts: dto.assignmentAlerts }),
        ...(dto.statusUpdateAlerts !== undefined && { statusUpdateAlerts: dto.statusUpdateAlerts }),
        ...(dto.slaRiskAlerts !== undefined && { slaRiskAlerts: dto.slaRiskAlerts }),
        ...(dto.escalationAlerts !== undefined && { escalationAlerts: dto.escalationAlerts }),
        ...(dto.resolutionReminders !== undefined && { resolutionReminders: dto.resolutionReminders }),
        ...(dto.requestUpdateDigest !== undefined && { requestUpdateDigest: dto.requestUpdateDigest }),
        ...(dto.commentNotifications !== undefined && { commentNotifications: dto.commentNotifications }),
        ...(dto.mentionNotifications !== undefined && { mentionNotifications: dto.mentionNotifications }),
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

  async updateTenantUserRole(tenantId: string, actorUserId: string, targetUserId: string, roleCode: string): Promise<void> {
    const targetUser = await this.prisma.user.findFirst({
      where: {
        id: targetUserId,
        tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User', targetUserId);
    }

    const now = new Date();
    const mappedLegacyRole = this.mapRoleCodeToLegacyRole(roleCode);

    await this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: {
          tenantId_userId: {
            tenantId,
            userId: targetUserId,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (membership) {
        await tx.membership.update({
          where: { id: membership.id },
          data: {
            roleCode,
            status: membership.status === MembershipStatus.REMOVED ? MembershipStatus.ACTIVE : membership.status,
            joinedAt: membership.status === MembershipStatus.ACTIVE ? undefined : now,
          },
        });
      } else {
        await tx.membership.create({
          data: {
            tenantId,
            userId: targetUserId,
            roleCode,
            status: MembershipStatus.ACTIVE,
            invitedAt: now,
            joinedAt: now,
          },
        });
      }

      await tx.user.update({
        where: { id: targetUserId },
        data: {
          role: mappedLegacyRole,
          status: UserStatus.ACTIVE,
          isActive: true,
        },
      });

      await this.revokeTenantUserSessionsTx(tx, tenantId, targetUserId, 'ROLE_CHANGED');

      await tx.auditLog.create({
        data: {
          tenantId,
          entityType: 'USER',
          entityId: targetUserId,
          action: 'USER_ROLE_CHANGED',
          actorId: actorUserId,
          beforeData: Prisma.JsonNull,
          afterData: {
            roleCode,
          },
        },
      });
    });
  }

  async updateTenantUserDepartment(
    tenantId: string,
    actorUserId: string,
    targetUserId: string,
    department?: string,
  ): Promise<void> {
    const targetUser = await this.prisma.user.findFirst({
      where: {
        id: targetUserId,
        tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User', targetUserId);
    }

    const normalizedDepartment = department?.trim();
    const nextDepartment = normalizedDepartment ? normalizedDepartment : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          department: nextDepartment,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          entityType: 'USER',
          entityId: targetUserId,
          action: 'USER_DEPARTMENT_CHANGED',
          actorId: actorUserId,
          beforeData: Prisma.JsonNull,
          afterData: {
            department: nextDepartment,
          },
        },
      });
    });
  }

  async deactivateTenantUser(tenantId: string, actorUserId: string, targetUserId: string, reason?: string): Promise<void> {
    const targetUser = await this.prisma.user.findFirst({
      where: {
        id: targetUserId,
        tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User', targetUserId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.membership.updateMany({
        where: {
          tenantId,
          userId: targetUserId,
          status: {
            in: [MembershipStatus.ACTIVE, MembershipStatus.INVITED],
          },
        },
        data: {
          status: MembershipStatus.SUSPENDED,
        },
      });

      await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: UserStatus.DEACTIVATED,
          isActive: false,
        },
      });

      await this.revokeTenantUserSessionsTx(tx, tenantId, targetUserId, reason?.trim() || 'USER_DEACTIVATED');

      await tx.auditLog.create({
        data: {
          tenantId,
          entityType: 'USER',
          entityId: targetUserId,
          action: 'USER_DEACTIVATED',
          actorId: actorUserId,
          beforeData: Prisma.JsonNull,
          afterData: {
            reason: reason?.trim() || null,
          },
        },
      });
    });
  }

  async reactivateTenantUser(tenantId: string, actorUserId: string, targetUserId: string, reason?: string): Promise<void> {
    const targetUser = await this.prisma.user.findFirst({
      where: {
        id: targetUserId,
        tenantId,
      },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User', targetUserId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.membership.updateMany({
        where: {
          tenantId,
          userId: targetUserId,
          status: {
            in: [MembershipStatus.SUSPENDED, MembershipStatus.INVITED],
          },
        },
        data: {
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: UserStatus.ACTIVE,
          isActive: true,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          entityType: 'USER',
          entityId: targetUserId,
          action: 'USER_REACTIVATED',
          actorId: actorUserId,
          beforeData: Prisma.JsonNull,
          afterData: {
            reason: reason?.trim() || null,
          },
        },
      });
    });
  }

  async revokeMySession(
    tenantId: string,
    userId: string,
    sessionId: string,
    currentTokenHash?: string,
  ): Promise<{ revokedCurrent: boolean }> {
    const session = await this.prisma.refreshSession.findFirst({
      where: {
        id: sessionId,
        tenantId,
        userId,
      },
      select: {
        id: true,
        tokenHash: true,
        revokedAt: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session', sessionId);
    }

    if (!session.revokedAt) {
      await this.prisma.$transaction(async (tx) => {
        await tx.refreshSession.update({
          where: { id: sessionId },
          data: {
            revokedAt: new Date(),
            revokedReason: 'SESSION_REVOKED_BY_USER',
          },
        });

        await tx.refreshToken.updateMany({
          where: {
            token: session.tokenHash,
            revoked: false,
          },
          data: {
            revoked: true,
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            entityType: 'AUTH_SESSION',
            entityId: sessionId,
            action: 'AUTH_SESSION_REVOKED',
            actorId: userId,
            beforeData: Prisma.JsonNull,
            afterData: {
              targetSessionId: sessionId,
            },
          },
        });
      });
    }

    return {
      revokedCurrent: !!currentTokenHash && currentTokenHash === session.tokenHash,
    };
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

  private mapRoleCodeToLegacyRole(roleCode: string): Role {
    if (roleCode === 'TENANT_ADMIN') {
      return Role.SUPER_ADMIN;
    }

    if (roleCode === 'OPS_COORDINATOR') {
      return Role.ADMIN;
    }

    return Role.MEMBER;
  }

  private mapLegacyRoleToRoleCode(role: Role): 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN' {
    if (role === Role.SUPER_ADMIN) {
      return 'TENANT_ADMIN';
    }

    if (role === Role.ADMIN) {
      return 'OPS_COORDINATOR';
    }

    return 'EMPLOYEE';
  }

  private resolveRoleCodeWithFallback(
    roleCode: string | null | undefined,
    fallbackRole: Role,
  ): 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN' {
    if (
      roleCode === 'EMPLOYEE' ||
      roleCode === 'OPS_COORDINATOR' ||
      roleCode === 'TECHNICIAN' ||
      roleCode === 'TENANT_ADMIN'
    ) {
      return roleCode;
    }

    return this.mapLegacyRoleToRoleCode(fallbackRole);
  }

  private async resolveActiveMembershipSummary(userId: string, tenantId: string) {
    return this.prisma.membership.findFirst({
      where: {
        userId,
        tenantId,
        status: MembershipStatus.ACTIVE,
      },
      select: {
        roleCode: true,
        joinedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async revokeTenantUserSessionsTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    const now = new Date();
    await tx.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    await tx.refreshSession.updateMany({
      where: {
        tenantId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
        revokedReason: reason,
      },
    });
  }

  private buildAcceptInviteUrl(token: string): string {
    const baseUrl = this.configService.get<string>('auth.webAppBaseUrl', 'http://localhost:3000').replace(/\/$/, '');
    return `${baseUrl}/en/invite/accept?token=${encodeURIComponent(token)}`;
  }
}
