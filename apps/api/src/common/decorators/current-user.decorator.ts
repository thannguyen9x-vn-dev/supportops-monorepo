import { UnauthorizedException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | JwtPayload[keyof JwtPayload] => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('User context is missing');
    }

    if (!data) {
      return user;
    }

    const value = user[data];
    if (value === undefined || value === null) {
      throw new UnauthorizedException(`User field ${String(data)} is missing`);
    }

    return value;
  },
);
