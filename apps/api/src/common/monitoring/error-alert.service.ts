import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ErrorAlertInput {
  method: string;
  path: string;
  status: number;
  traceId: string;
  message: string;
}

@Injectable()
export class ErrorAlertService {
  private readonly logger = new Logger(ErrorAlertService.name);
  private readonly timestamps: number[] = [];
  private lastAlertAt = 0;

  constructor(private readonly configService: ConfigService) {}

  async recordServerError(input: ErrorAlertInput): Promise<void> {
    const now = Date.now();
    const windowMs = this.configService.get<number>('app.errorAlertWindowMs', 300_000);
    const threshold = this.configService.get<number>('app.errorAlertThreshold', 20);
    const cooldownMs = this.configService.get<number>('app.errorAlertCooldownMs', 900_000);

    this.timestamps.push(now);
    this.prune(windowMs, now);

    if (this.timestamps.length < threshold) {
      return;
    }

    if (now - this.lastAlertAt < cooldownMs) {
      return;
    }

    this.lastAlertAt = now;
    const alertMessage = `High 5xx rate detected: ${this.timestamps.length} errors in ${Math.round(windowMs / 1000)}s. latest=${input.method} ${input.path} status=${input.status} traceId=${input.traceId}`;
    this.logger.error(alertMessage);

    const webhookUrl = this.configService.get<string>('app.errorAlertWebhookUrl', '').trim();
    if (!webhookUrl) {
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text: alertMessage,
          latestError: input,
          emittedAt: new Date(now).toISOString(),
        }),
      });
    } catch (error) {
      this.logger.error(`Failed to send alert webhook: ${(error as Error).message}`);
    }
  }

  private prune(windowMs: number, now: number): void {
    const minTs = now - windowMs;
    while (this.timestamps.length > 0 && this.timestamps[0]! < minTs) {
      this.timestamps.shift();
    }
  }
}
