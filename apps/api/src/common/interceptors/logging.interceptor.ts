import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string; url: string; headers: Record<string, unknown> }>();
    const { method, url } = request;
    const traceId = request.headers['x-trace-id'];
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<{ statusCode: number }>();
          const duration = Date.now() - now;
          this.logger.log(`${method} ${url} ${response.statusCode} ${duration}ms [${String(traceId)}]`);
        },
        error: (error: { status?: number; message?: string }) => {
          const duration = Date.now() - now;
          this.logger.error(
            `${method} ${url} ${error.status ?? 500} ${duration}ms [${String(traceId)}] ${error.message ?? 'error'}`,
          );
        },
      }),
    );
  }
}
