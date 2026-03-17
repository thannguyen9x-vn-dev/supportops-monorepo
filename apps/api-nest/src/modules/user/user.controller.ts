import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UploadedBinaryFile } from '../../common/types/uploaded-file.type';
import { AvatarUploadResponseDto } from './dto/avatar-upload-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { UserPreferencesResponseDto } from './dto/user-preferences-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentTenant() tenantId: string, @CurrentUser('sub') userId: string): Promise<UserResponseDto> {
    return this.userService.getMe(tenantId, userId);
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
}
