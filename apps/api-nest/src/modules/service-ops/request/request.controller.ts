import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestService } from './request.service';

@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create request (draft or submit)' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') requesterId: string,
    @Body() dto: CreateRequestDto,
  ): Promise<RequestResponseDto> {
    return this.requestService.create(tenantId, requesterId, dto);
  }
}
