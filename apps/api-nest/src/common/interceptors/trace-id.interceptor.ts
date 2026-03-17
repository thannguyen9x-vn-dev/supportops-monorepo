import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const response = context.switchToHttp().getResponse<{ setHeader: (name: string, value: string) => void }>();

    const headerValue = request.headers['x-trace-id'];
    const traceId = typeof headerValue === 'string' ? headerValue : randomUUID();
    request.headers['x-trace-id'] = traceId;

    return next.handle().pipe(
      tap(() => {
        response.setHeader('x-trace-id', traceId);
      }),
    );
  }
}
