import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPermissions } from '../../../common/decorators/current-permissions.decorator';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RequestResponseDto } from '../request/dto/request-response.dto';
import { ConfirmResolutionDto } from './dto/confirm-resolution.dto';
import { ReopenResolutionDto } from './dto/reopen-resolution.dto';
import { ResolutionService } from './resolution.service';

@ApiTags('Resolutions')
@ApiBearerAuth()
@Controller('requests/:requestId/resolution')
export class ResolutionController {
  constructor(private readonly resolutionService: ResolutionService) {}

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @Permissions({ any: ['request.resolve', 'request.close'] })
  @ApiOperation({ summary: 'Confirm resolution and optionally close request' })
  confirm(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: ConfirmResolutionDto,
  ): Promise<RequestResponseDto> {
    return this.resolutionService.confirm(tenantId, actorId, permissions, requestId, dto);
  }

  @Post('reopen')
  @HttpCode(HttpStatus.OK)
  @Permissions({ all: ['request.reopen'] })
  @ApiOperation({ summary: 'Reopen previously resolved or closed request' })
  reopen(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: ReopenResolutionDto,
  ): Promise<RequestResponseDto> {
    return this.resolutionService.reopen(tenantId, actorId, permissions, requestId, dto);
  }
}
