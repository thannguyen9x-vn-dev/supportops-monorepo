import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { AppException } from './common/exceptions/app.exception';
import { ReadinessCheckResult, ReadinessService } from './common/health/readiness.service';

@Controller()
export class AppController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Public()
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  @Public()
  @Get('ready')
  async getReadiness(): Promise<ReadinessCheckResult> {
    const result = await this.readinessService.check();
    if (result.status !== 'ready') {
      throw new AppException(503, 'SERVICE_UNAVAILABLE', 'Readiness check failed', [
        `database=${result.checks.database}`,
        `redis=${result.checks.redis}`,
      ]);
    }

    return result;
  }
}
