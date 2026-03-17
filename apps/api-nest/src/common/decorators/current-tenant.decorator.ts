import { UnauthorizedException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';

export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
  const tenantId = request.user?.tenantId;
  if (!tenantId) {
    throw new UnauthorizedException('Tenant context is missing');
  }
  return tenantId;
});
