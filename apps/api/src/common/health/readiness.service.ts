import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

export interface ReadinessCheckResult {
  status: 'ready' | 'not_ready';
  checks: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
  };
}

@Injectable()
export class ReadinessService {
  private readonly logger = new Logger(ReadinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<ReadinessCheckResult> {
    const [databaseUp, redisUp] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

    const status = databaseUp && redisUp ? 'ready' : 'not_ready';
    return {
      status,
      checks: {
        database: databaseUp ? 'up' : 'down',
        redis: redisUp ? 'up' : 'down',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(`Database readiness check failed: ${(error as Error).message}`);
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    const redisUrl = this.configService.get<string>('app.redisUrl', '');
    if (!redisUrl) {
      this.logger.error('Redis readiness check failed: REDIS_URL is not configured');
      return false;
    }

    const redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      connectTimeout: 1_500,
    });

    try {
      await redis.connect();
      const pong = await redis.ping();
      return pong === 'PONG';
    } catch (error) {
      this.logger.error(`Redis readiness check failed: ${(error as Error).message}`);
      return false;
    } finally {
      redis.disconnect();
    }
  }
}
