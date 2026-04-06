import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AiService } from './ai.service';
import { AiSettingsResponseDto } from './dto/ai-settings-response.dto';
import { AskRequestDto } from './dto/ask-request.dto';
import { AskResponseDto } from './dto/ask-response.dto';
import { UpdateAiSettingsDto } from './dto/update-ai-settings.dto';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @Permissions({ all: ['ai.ask'] })
  @ApiOperation({ summary: 'Ask the AI assistant a question about operational data' })
  ask(@CurrentTenant() tenantId: string, @Body() dto: AskRequestDto): Promise<AskResponseDto> {
    return this.aiService.ask(tenantId, dto);
  }

  @Get('settings')
  @Permissions({ all: ['ai.ask'] })
  @ApiOperation({ summary: 'Get AI settings for the current tenant' })
  getSettings(@CurrentTenant() tenantId: string): Promise<AiSettingsResponseDto> {
    return this.aiService.getSettings(tenantId);
  }

  @Patch('settings')
  @Permissions({ all: ['ai.ask'] })
  @ApiOperation({ summary: 'Update AI settings for the current tenant' })
  updateSettings(@CurrentTenant() tenantId: string, @Body() dto: UpdateAiSettingsDto): Promise<AiSettingsResponseDto> {
    return this.aiService.updateSettings(tenantId, dto);
  }
}
