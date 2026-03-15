import { Injectable, Logger, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
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

    const { user } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: organizationName,
          slug: tenantSlug,
        },
      });

      const createdUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: Role.MEMBER,
        },
      });

      return { user: createdUser };
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.resolveUserForLogin(dto);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(updatedUser);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const hashedToken = this.hashToken(dto.refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revoked: true },
    });

    return this.issueTokens(tokenRecord.user);
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    if (!dto.refreshToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: { token: this.hashToken(dto.refreshToken), revoked: false },
      data: { revoked: true },
    });
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

    const rawToken = `${randomUUID()}.${randomUUID()}`;
    const tokenHash = this.hashToken(rawToken);
    const ttlSeconds = this.configService.get<number>('auth.passwordResetTokenTtlSeconds', 3600);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        },
      }),
    ]);

    this.logger.log(`Password reset token issued for userId=${user.id}`);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new UnprocessableEntityException('Passwords do not match');
    }

    const passwordResetToken = await this.prisma.passwordResetToken.findFirst({
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

    if (!passwordResetToken) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: passwordResetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: passwordResetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: passwordResetToken.userId, revoked: false },
        data: { revoked: true },
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
    if (users.length !== 1) {
      return null;
    }

    return users[0];
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
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

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    const accessTokenTtl = this.configService.get<number>('jwt.accessTokenTtlSeconds', 900);
    const refreshTokenTtl = this.configService.get<number>('jwt.refreshTokenTtlSeconds', 604800);

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessTokenTtl,
    });

    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + refreshTokenTtl * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenTtl,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
