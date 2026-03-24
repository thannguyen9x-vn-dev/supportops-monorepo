import { Injectable, Logger, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MembershipStatus, Prisma, Role, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt, randomUUID } from 'crypto';
import { AppException } from '../../common/exceptions/app.exception';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthMailService } from './auth-mail.service';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authMailService: AuthMailService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const organizationName = (dto.organizationName ?? dto.tenantName ?? '').trim();
    if (!organizationName) {
      throw new UnprocessableEntityException('organizationName is required');
    }

    const tenantSlug = dto.tenantSlug?.trim() || (await this.generateTenantSlug(organizationName));

    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (existingTenant) {
      throw new ConflictException('TENANT_SLUG_ALREADY_EXISTS', `Tenant slug already exists: ${tenantSlug}`);
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
      },
    });
    if (existingUser) {
      throw new ConflictException('EMAIL_ALREADY_EXISTS', 'Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: organizationName,
          slug: tenantSlug,
        },
      });

      return tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: Role.MEMBER,
          isEmailVerified: false,
        },
      });
    });

    await this.issueEmailVerificationToken(user);

    return {
      message: 'Registration successful. Please verify your email before signing in.',
      requiresEmailVerification: true,
      email: user.email,
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const token = await this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash: this.hashToken(dto.token),
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid or expired verification link');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: token.userId },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!user || user.isEmailVerified) {
      return;
    }

    await this.issueEmailVerificationToken(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.resolveUserForLogin(dto);

    if (!user || !this.isUserAllowedToAuthenticate(user)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new AppException(401, 'EMAIL_NOT_VERIFIED', 'Email is not verified');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const membership = await this.resolveActiveMembership(updatedUser.id, updatedUser.tenantId);

    return this.issueTokens(updatedUser, {
      rememberMe: dto.rememberMe === true,
      membership,
    });
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const hashedToken = this.hashToken(dto.refreshToken);

    const refreshSessionRecord = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: hashedToken },
      include: {
        user: true,
        membership: true,
      },
    });

    if (refreshSessionRecord) {
      if (
        refreshSessionRecord.revokedAt ||
        refreshSessionRecord.expiresAt <= new Date() ||
        !this.isUserAllowedToAuthenticate(refreshSessionRecord.user) ||
        refreshSessionRecord.membership.status !== MembershipStatus.ACTIVE
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await this.prisma.refreshToken.updateMany({
        where: { token: hashedToken, revoked: false },
        data: { revoked: true },
      });

      const rememberMe = this.isRememberMeToken(refreshSessionRecord.createdAt, refreshSessionRecord.expiresAt);

      return this.issueTokens(refreshSessionRecord.user, {
        rememberMe,
        membership: refreshSessionRecord.membership,
        tokenFamilyId: refreshSessionRecord.tokenFamilyId,
        previousRefreshSessionId: refreshSessionRecord.id,
      });
    }

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt <= new Date() || !this.isUserAllowedToAuthenticate(tokenRecord.user)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    const rememberMe = this.isRememberMeToken(tokenRecord.createdAt, tokenRecord.expiresAt);
    const membership = await this.resolveActiveMembership(tokenRecord.user.id, tokenRecord.user.tenantId);
    return this.issueTokens(tokenRecord.user, { rememberMe, membership });
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    if (!dto.refreshToken) {
      return;
    }

    const hashedToken = this.hashToken(dto.refreshToken);
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { token: hashedToken, revoked: false },
        data: { revoked: true },
      }),
      this.prisma.refreshSession.updateMany({
        where: { tokenHash: hashedToken, revokedAt: null },
        data: {
          revokedAt: new Date(),
          revokedReason: 'LOGOUT',
        },
      }),
    ]);
  }

  async logoutAll(userId: string, tenantId: string): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revoked: false,
        },
        data: {
          revoked: true,
        },
      }),
      this.prisma.refreshSession.updateMany({
        where: {
          userId,
          tenantId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
          revokedReason: 'LOGOUT_ALL',
        },
      }),
      this.prisma.auditLog.create({
        data: {
          tenantId,
          entityType: 'AUTH_SESSION',
          entityId: userId,
          action: 'AUTH_LOGOUT_ALL',
          actorId: userId,
          beforeData: Prisma.JsonNull,
          afterData: {
            tenantId,
            userId,
          },
        },
      }),
    ]);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return;
    }

    const code = this.generateOtpCode();
    const codeHash = this.hashToken(code);
    const ttlSeconds = this.configService.get<number>('auth.passwordResetCodeTtlSeconds', 600);
    const resetUrl = this.buildResetPasswordUrl(user.email);

    await this.prisma.$transaction([
      this.prisma.passwordResetOtp.deleteMany({ where: { userId: user.id } }),
      this.prisma.passwordResetOtp.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        },
      }),
    ]);

    await this.authMailService.sendPasswordResetCodeEmail(
      user.email,
      code,
      Math.ceil(ttlSeconds / 60),
      resetUrl,
      user.id,
      user.tenantId,
    );
    this.logger.log(`Password reset OTP issued for userId=${user.id}`);
  }

  async acceptInvite(dto: AcceptInviteDto): Promise<void> {
    if (dto.password !== dto.confirmPassword) {
      throw new UnprocessableEntityException('Passwords do not match');
    }

    const invite = await this.prisma.invite.findFirst({
      where: {
        tokenHash: this.hashToken(dto.token),
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invite) {
      throw new UnauthorizedException('Invalid or expired invite link');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        tenantId: invite.tenantId,
        email: {
          equals: invite.email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invite user account does not exist');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        tenantId_userId: {
          tenantId: invite.tenantId,
          userId: user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('Invite membership does not exist');
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const { firstName, lastName, fullName } = this.splitFullName(dto.fullName);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          fullName,
          passwordHash,
          isEmailVerified: true,
          emailVerifiedAt: now,
          isActive: true,
          status: UserStatus.ACTIVE,
        },
      }),
      this.prisma.membership.update({
        where: { id: membership.id },
        data: {
          roleCode: invite.roleCode,
          status: MembershipStatus.ACTIVE,
          joinedAt: now,
        },
      }),
      this.prisma.invite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: now,
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
      }),
      this.prisma.refreshSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: {
          revokedAt: now,
          revokedReason: 'INVITE_ACCEPTED',
        },
      }),
      this.prisma.auditLog.create({
        data: {
          tenantId: invite.tenantId,
          entityType: 'USER',
          entityId: user.id,
          action: 'INVITE_ACCEPTED',
          actorId: user.id,
          beforeData: Prisma.JsonNull,
          afterData: {
            inviteId: invite.id,
            roleCode: invite.roleCode,
          },
        },
      }),
    ]);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new UnprocessableEntityException('Passwords do not match');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or reset code');
    }

    const resetOtp = await this.prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        codeHash: this.hashToken(dto.code),
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetOtp) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      this.prisma.passwordResetOtp.update({
        where: { id: resetOtp.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revoked: false },
        data: { revoked: true },
      }),
      this.prisma.refreshSession.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          revokedReason: 'PASSWORD_RESET',
        },
      }),
    ]);
  }

  private async resolveUserForLogin(dto: LoginDto): Promise<User | null> {
    if (dto.tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({ where: { slug: dto.tenantSlug } });
      if (!tenant) {
        return null;
      }

      return this.prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: dto.email,
          },
        },
      });
    }

    const users = await this.prisma.user.findMany({
      where: {
        email: {
          equals: dto.email,
          mode: 'insensitive',
        },
      },
    });

    if (users.length === 0) {
      return null;
    }

    if (users.length === 1) {
      return users[0];
    }

    const activeCandidates = users.filter((user) => user.isActive);
    if (activeCandidates.length === 1) {
      return activeCandidates[0];
    }

    // Automatic tenant resolution path:
    // if the same email exists in multiple tenants, pick the only account
    // whose password matches the submitted credential.
    const matchedByPassword: User[] = [];
    for (const user of activeCandidates) {
      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (isPasswordValid) {
        matchedByPassword.push(user);
      }
    }

    if (matchedByPassword.length === 1) {
      return matchedByPassword[0];
    }

    return null;
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private generateOtpCode(): string {
    return randomInt(0, 100_000_000).toString().padStart(8, '0');
  }

  private async issueEmailVerificationToken(user: User): Promise<void> {
    const rawToken = `${randomUUID()}.${randomUUID()}`;
    const tokenHash = this.hashToken(rawToken);
    const ttlSeconds = this.configService.get<number>('auth.emailVerificationTokenTtlSeconds', 86400);

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
      this.prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        },
      }),
    ]);

    const verificationUrl = this.buildVerificationUrl(rawToken, user.email);
    await this.authMailService.sendVerificationEmail(user.email, verificationUrl, user.id, user.tenantId);
  }

  private buildVerificationUrl(token: string, email: string): string {
    const baseUrl = this.configService.get<string>('auth.webAppBaseUrl', 'http://localhost:3000').replace(/\/$/, '');
    return `${baseUrl}/en/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  }

  private buildResetPasswordUrl(email: string): string {
    const baseUrl = this.configService.get<string>('auth.webAppBaseUrl', 'http://localhost:3000').replace(/\/$/, '');
    return `${baseUrl}/en/reset-password?email=${encodeURIComponent(email)}`;
  }

  private splitFullName(rawFullName: string): { firstName: string; lastName: string; fullName: string } {
    const normalized = rawFullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .join(' ');

    const fallback = 'Invited User';
    const fullName = normalized || fallback;
    const segments = fullName.split(' ');
    const firstName = segments[0] || 'Invited';
    const lastName = segments.slice(1).join(' ') || 'User';

    return { firstName, lastName, fullName };
  }

  private async generateTenantSlug(organizationName: string): Promise<string> {
    const baseSlug = organizationName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const normalizedBase = baseSlug || 'tenant';
    let candidate = normalizedBase;
    let suffix = 1;

    while (await this.prisma.tenant.findUnique({ where: { slug: candidate } })) {
      suffix += 1;
      candidate = `${normalizedBase}-${suffix}`;
    }

    return candidate;
  }

  private getRememberRefreshTokenTtlSeconds(): number {
    return this.configService.get<number>('jwt.refreshTokenTtlSeconds', 604800);
  }

  private getSessionRefreshTokenTtlSeconds(): number {
    return this.configService.get<number>('jwt.sessionRefreshTokenTtlSeconds', 86400);
  }

  private isUserAllowedToAuthenticate(user: User): boolean {
    if (!user.isActive) {
      return false;
    }

    if (user.status === UserStatus.DEACTIVATED || user.status === UserStatus.SUSPENDED) {
      return false;
    }

    return true;
  }

  private mapMembershipRoleCodeToLegacyRole(roleCode: string | undefined, fallback: Role): Role {
    if (!roleCode) {
      return fallback;
    }

    if (roleCode === 'TENANT_ADMIN') {
      return Role.SUPER_ADMIN;
    }

    if (roleCode === 'OPS_COORDINATOR') {
      return Role.ADMIN;
    }

    if (roleCode === 'TECHNICIAN' || roleCode === 'EMPLOYEE') {
      return Role.MEMBER;
    }

    if (roleCode === Role.SUPER_ADMIN || roleCode === Role.ADMIN || roleCode === Role.MEMBER) {
      return roleCode;
    }

    return fallback;
  }

  private mapLegacyRoleToSystemRole(role: Role): 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN' {
    if (role === Role.SUPER_ADMIN) {
      return 'TENANT_ADMIN';
    }

    if (role === Role.ADMIN) {
      return 'OPS_COORDINATOR';
    }

    return 'EMPLOYEE';
  }

  private normalizeSystemRoleCode(
    roleCode: string | undefined,
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

    return this.mapLegacyRoleToSystemRole(fallbackRole);
  }

  private async resolveActiveMembership(userId: string, tenantId: string) {
    return this.prisma.membership.findFirst({
      where: {
        userId,
        tenantId,
        status: MembershipStatus.ACTIVE,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private isRememberMeToken(createdAt: Date, expiresAt: Date): boolean {
    const tokenLifetimeSeconds = Math.max(0, Math.round((expiresAt.getTime() - createdAt.getTime()) / 1000));
    const rememberLifetimeSeconds = this.getRememberRefreshTokenTtlSeconds();
    const sessionLifetimeSeconds = this.getSessionRefreshTokenTtlSeconds();

    const rememberDelta = Math.abs(tokenLifetimeSeconds - rememberLifetimeSeconds);
    const sessionDelta = Math.abs(tokenLifetimeSeconds - sessionLifetimeSeconds);

    return rememberDelta <= sessionDelta;
  }

  private async issueTokens(
    user: User,
    options?: {
      rememberMe?: boolean;
      membership?: {
        id: string;
        tenantId: string;
        roleCode: string;
        joinedAt?: Date | null;
      } | null;
      tokenFamilyId?: string;
      previousRefreshSessionId?: string;
    },
  ): Promise<AuthResponseDto> {
    const membership = options?.membership ?? (await this.resolveActiveMembership(user.id, user.tenantId));
    const effectiveRole = this.mapMembershipRoleCodeToLegacyRole(membership?.roleCode, user.role);
    const effectiveRoleCode = this.normalizeSystemRoleCode(membership?.roleCode, effectiveRole);

    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: effectiveRole,
      email: user.email,
    };

    const accessTokenTtl = this.configService.get<number>('jwt.accessTokenTtlSeconds', 900);
    const rememberMe = options?.rememberMe === true;
    const refreshTokenTtl = rememberMe
      ? this.getRememberRefreshTokenTtlSeconds()
      : this.getSessionRefreshTokenTtlSeconds();

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessTokenTtl,
    });

    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + refreshTokenTtl * 1000);
    const now = new Date();
    const tokenFamilyId = options?.tokenFamilyId ?? randomUUID();

    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.create({
        data: {
          userId: user.id,
          token: this.hashToken(refreshToken),
          expiresAt,
        },
      });

      if (membership) {
        const newSession = await tx.refreshSession.create({
          data: {
            tenantId: membership.tenantId,
            userId: user.id,
            membershipId: membership.id,
            tokenHash: this.hashToken(refreshToken),
            tokenFamilyId,
            expiresAt,
            lastUsedAt: now,
          },
          select: { id: true },
        });

        if (options?.previousRefreshSessionId) {
          await tx.refreshSession.update({
            where: { id: options.previousRefreshSessionId },
            data: {
              revokedAt: now,
              revokedReason: 'ROTATED',
              replacedBySessionId: newSession.id,
              lastUsedAt: now,
            },
          });
        }
      } else {
        this.logger.warn(`No active membership for userId=${user.id} tenantId=${user.tenantId}; skipped refresh_sessions write.`);
      }
    });

    return {
      accessToken,
      refreshToken,
      rememberMe,
      expiresIn: accessTokenTtl,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: effectiveRoleCode,
        joinedAt: membership?.joinedAt?.toISOString() ?? null,
      },
      membership: membership
        ? {
            id: membership.id,
            tenantId: membership.tenantId,
            roleCode: membership.roleCode,
          }
        : undefined,
    };
  }
}
