import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((responseData: unknown) => {
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          return responseData;
        }

        if (responseData === undefined || responseData === null) {
          return responseData;
        }

        return { data: responseData };
      }),
    );
  }
}
