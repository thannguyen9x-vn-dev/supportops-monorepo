import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { AuthMessageResponseDto } from './dto/auth-message-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private static readonly REFRESH_COOKIE_NAME = 'supportops_refresh_token';

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register tenant and user, then require email verification' })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify account email via token in email link' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<AuthMessageResponseDto> {
    await this.authService.verifyEmail(dto);
    return { message: 'Email verified successfully.' };
  }

  @Public()
  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend account email verification link' })
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto): Promise<AuthMessageResponseDto> {
    await this.authService.resendVerificationEmail(dto.email);
    return { message: 'If the account exists and is unverified, we sent a verification email.' };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with tenant + email + password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(response, result.refreshToken, result.rememberMe === true);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token by refresh token (cookie or body)' })
  async refresh(
    @Req() request: Request,
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = dto.refreshToken ?? this.getRefreshCookie(request);
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.authService.refresh({ refreshToken });
    this.setRefreshCookie(response, result.refreshToken, result.rememberMe === true);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke refresh token (cookie or body)' })
  async logout(@Req() request: Request, @Body() dto: RefreshTokenDto, @Res({ passthrough: true }) response: Response): Promise<void> {
    const refreshToken = dto.refreshToken ?? this.getRefreshCookie(request);
    if (refreshToken) {
      await this.authService.logout({ refreshToken });
    }
    this.clearRefreshCookie(response);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke all active sessions for current tenant context' })
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @CurrentTenant() tenantId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logoutAll(userId, tenantId);
    this.clearRefreshCookie(response);
  }

  @Public()
  @Post('invite/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invite token, set password, activate account membership' })
  async acceptInvite(@Body() dto: AcceptInviteDto): Promise<AuthMessageResponseDto> {
    await this.authService.acceptInvite(dto);
    return { message: 'Invite accepted successfully. You can sign in now.' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request reset password OTP code' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<AuthMessageResponseDto> {
    await this.authService.forgotPassword(dto);
    return { message: 'If the account exists, we sent a reset code.' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password by email and OTP code' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<AuthMessageResponseDto> {
    await this.authService.resetPassword(dto);
    return { message: 'Password has been reset successfully.' };
  }

  private setRefreshCookie(response: Response, refreshToken?: string, rememberMe = false): void {
    if (!refreshToken) {
      return;
    }

    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax';
      path: '/';
      maxAge?: number;
    } = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    if (rememberMe) {
      const maxAgeSeconds = this.configService.get<number>('jwt.refreshTokenTtlSeconds', 604800);
      cookieOptions.maxAge = maxAgeSeconds * 1000;
    }

    response.cookie(AuthController.REFRESH_COOKIE_NAME, refreshToken, cookieOptions);
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(AuthController.REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  }

  private getRefreshCookie(request: Request): string | undefined {
    const rawCookie = request.headers.cookie;
    if (!rawCookie) {
      return undefined;
    }

    const tokenPart = rawCookie
      .split(';')
      .map((part) => part.trim())
      .find(
        (part) =>
          part.startsWith(`${AuthController.REFRESH_COOKIE_NAME}=`) || part.startsWith('refresh_token='),
      );

    if (!tokenPart) {
      return undefined;
    }

    const nameLength = tokenPart.startsWith(`${AuthController.REFRESH_COOKIE_NAME}=`)
      ? `${AuthController.REFRESH_COOKIE_NAME}=`.length
      : 'refresh_token='.length;

    return decodeURIComponent(tokenPart.slice(nameLength));
  }
}
