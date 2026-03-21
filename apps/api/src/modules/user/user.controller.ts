import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createHash } from 'crypto';
import type { Request, Response } from 'express';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { AvatarUploadResponseDto } from './dto/avatar-upload-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { DeactivateTenantUserDto } from './dto/deactivate-tenant-user.dto';
import { InviteTenantUserDto } from './dto/invite-tenant-user.dto';
import { InviteTenantUserResponseDto } from './dto/invite-tenant-user-response.dto';
import { ReactivateTenantUserDto } from './dto/reactivate-tenant-user.dto';
import { TenantUserResponseDto } from './dto/tenant-user-response.dto';
import { UpdateTenantUserDepartmentDto } from './dto/update-tenant-user-department.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateTenantUserRoleDto } from './dto/update-tenant-user-role.dto';
import { UserSessionResponseDto } from './dto/user-session-response.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UserPreferencesResponseDto } from './dto/user-preferences-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  private static readonly REFRESH_COOKIE_NAME = 'supportops_refresh_token';

  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentTenant() tenantId: string, @CurrentUser('sub') userId: string): Promise<UserResponseDto> {
    return this.userService.getMe(tenantId, userId);
  }

  @Get()
  @Permissions({ any: ['user.invite', 'role.manage', 'user.deactivate'] })
  @ApiOperation({ summary: 'List users in current tenant with membership info' })
  listTenantUsers(@CurrentTenant() tenantId: string): Promise<TenantUserResponseDto[]> {
    return this.userService.listTenantUsers(tenantId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateMe(tenantId, userId, dto);
  }

  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.userService.changePassword(tenantId, userId, dto);
  }

  @Put('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Backward compatible alias for password change' })
  async changePasswordAlias(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.userService.changePassword(tenantId, userId, dto);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get current user notification preferences' })
  getPreferences(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
  ): Promise<UserPreferencesResponseDto> {
    return this.userService.getPreferences(tenantId, userId);
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'List current user refresh sessions for tenant' })
  listMySessions(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ): Promise<UserSessionResponseDto[]> {
    const currentTokenHash = this.resolveRefreshTokenHashFromCookie(request);
    return this.userService.listMySessions(tenantId, userId, currentTokenHash);
  }

  @Delete('me/sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke one current user refresh session by id' })
  async revokeMySession(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const currentTokenHash = this.resolveRefreshTokenHashFromCookie(request);
    const result = await this.userService.revokeMySession(tenantId, userId, sessionId, currentTokenHash);
    if (result.revokedCurrent) {
      this.clearRefreshCookie(response);
    }
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update current user notification preferences' })
  updatePreferences(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateUserPreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    return this.userService.updatePreferences(tenantId, userId, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload current user avatar' })
  uploadAvatar(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @UploadedFile() file?: UploadedBinaryFile,
  ): Promise<AvatarUploadResponseDto> {
    return this.userService.uploadAvatar(tenantId, userId, file);
  }

  @Patch(':id/role')
  @Permissions({ all: ['role.manage'] })
  @ApiOperation({ summary: 'Update tenant user role and revoke active sessions' })
  async updateTenantUserRole(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorUserId: string,
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateTenantUserRoleDto,
  ): Promise<void> {
    await this.userService.updateTenantUserRole(tenantId, actorUserId, targetUserId, dto.roleCode);
  }

  @Patch(':id/department')
  @Permissions({ all: ['role.manage'] })
  @ApiOperation({ summary: 'Update tenant user department' })
  async updateTenantUserDepartment(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorUserId: string,
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: UpdateTenantUserDepartmentDto,
  ): Promise<void> {
    await this.userService.updateTenantUserDepartment(tenantId, actorUserId, targetUserId, dto.department);
  }

  @Post('invite')
  @Permissions({ all: ['user.invite'] })
  @ApiOperation({ summary: 'Invite user into tenant with role assignment' })
  inviteTenantUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorUserId: string,
    @Body() dto: InviteTenantUserDto,
  ): Promise<InviteTenantUserResponseDto> {
    return this.userService.inviteTenantUser(tenantId, actorUserId, dto);
  }

  @Patch(':id/deactivate')
  @Permissions({ all: ['user.deactivate'] })
  @ApiOperation({ summary: 'Deactivate tenant user and revoke active sessions' })
  async deactivateTenantUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorUserId: string,
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: DeactivateTenantUserDto,
  ): Promise<void> {
    await this.userService.deactivateTenantUser(tenantId, actorUserId, targetUserId, dto.reason);
  }

  @Patch(':id/reactivate')
  @Permissions({ all: ['user.deactivate'] })
  @ApiOperation({ summary: 'Reactivate tenant user and allow login again' })
  async reactivateTenantUser(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorUserId: string,
    @Param('id', ParseUUIDPipe) targetUserId: string,
    @Body() dto: ReactivateTenantUserDto,
  ): Promise<void> {
    await this.userService.reactivateTenantUser(tenantId, actorUserId, targetUserId, dto.reason);
  }

  private resolveRefreshTokenHashFromCookie(request: Request): string | undefined {
    const rawCookie = request.headers.cookie;
    if (!rawCookie) {
      return undefined;
    }

    const tokenPart = rawCookie
      .split(';')
      .map((part) => part.trim())
      .find(
        (part) =>
          part.startsWith(`${UserController.REFRESH_COOKIE_NAME}=`) || part.startsWith('refresh_token='),
      );

    if (!tokenPart) {
      return undefined;
    }

    const nameLength = tokenPart.startsWith(`${UserController.REFRESH_COOKIE_NAME}=`)
      ? `${UserController.REFRESH_COOKIE_NAME}=`.length
      : 'refresh_token='.length;

    const rawToken = decodeURIComponent(tokenPart.slice(nameLength));
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(UserController.REFRESH_COOKIE_NAME, {
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
}
