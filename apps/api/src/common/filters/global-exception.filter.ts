import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorAlertService } from '../monitoring/error-alert.service';
import { AppException } from '../exceptions/app.exception';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly errorAlertService: ErrorAlertService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = (request.headers['x-trace-id'] as string) ?? 'unknown';

    let status: number;
    let code: string;
    let message: string;
    let details: string[] | undefined;

    if (exception instanceof AppException) {
      status = exception.status;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const res = exResponse as { message?: string | string[] };
        code = this.mapStatusToCode(status);
        message = Array.isArray(res.message) ? res.message[0] : (res.message ?? exception.message);
        details = Array.isArray(res.message) ? res.message : undefined;
      } else {
        code = this.mapStatusToCode(status);
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred';
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred';
    }

    if (status >= 500) {
      void this.errorAlertService.recordServerError({
        method: request.method,
        path: request.url,
        status,
        traceId,
        message,
      });
    }

    response.status(status).json({
      error: {
        code,
        message,
        ...(details && { details }),
        traceId,
      },
    });
  }

  private mapStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      503: 'SERVICE_UNAVAILABLE',
    };

    return map[status] ?? 'INTERNAL_ERROR';
  }
}
