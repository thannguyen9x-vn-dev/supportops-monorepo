import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';
import { TenantContext } from '../../modules/tenant/tenant.context';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();

    return this.tenantContext.run(
      {
        tenantId: request.user?.tenantId,
        userId: request.user?.sub,
      },
      () => next.handle(),
    );
  }
}
