import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AiSettingsResponseDto } from './dto/ai-settings-response.dto';
import { AskRequestDto } from './dto/ask-request.dto';
import { AskResponseDto } from './dto/ask-response.dto';
import { UpdateAiSettingsDto } from './dto/update-ai-settings.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.aiServiceUrl = this.config.get<string>('AI_SERVICE_URL') ?? 'http://localhost:8000';
  }

  async ask(tenantId: string, dto: AskRequestDto): Promise<AskResponseDto> {
    const settings = await this.prisma.tenantAiSettings.findUnique({
      where: { tenantId },
      select: { defaultModel: true },
    });

    const model = dto.model ?? settings?.defaultModel ?? 'claude-sonnet-4-20250514';

    try {
      const response = await fetch(`${this.aiServiceUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          message: dto.message,
          history: dto.history,
          model,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        this.logger.error(`AI service responded with status ${response.status} for tenantId=${tenantId}`);
        throw new ServiceUnavailableException('AI service is currently unavailable');
      }

      const data = (await response.json()) as { reply: string; model: string };
      return { reply: data.reply, model: data.model };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      this.logger.error(`Failed to reach AI service: ${String(error)}`);
      throw new ServiceUnavailableException('AI service is currently unavailable');
    }
  }

  async getSettings(tenantId: string): Promise<AiSettingsResponseDto> {
    const settings = await this.prisma.tenantAiSettings.findUnique({
      where: { tenantId },
    });
    return AiSettingsResponseDto.from(settings);
  }

  async updateSettings(tenantId: string, dto: UpdateAiSettingsDto): Promise<AiSettingsResponseDto> {
    const settings = await this.prisma.tenantAiSettings.upsert({
      where: { tenantId },
      create: { tenantId, defaultModel: dto.defaultModel },
      update: { defaultModel: dto.defaultModel },
    });
    this.logger.log(`AI settings updated: tenantId=${tenantId}, model=${dto.defaultModel}`);
    return AiSettingsResponseDto.from(settings);
  }
}
