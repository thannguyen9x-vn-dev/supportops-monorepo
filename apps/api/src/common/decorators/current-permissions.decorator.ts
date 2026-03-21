import { UnauthorizedException, createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestWithAuthz = {
  authzPermissions?: string[];
};

export const CurrentPermissions = createParamDecorator((_data: unknown, ctx: ExecutionContext): string[] => {
  const request = ctx.switchToHttp().getRequest<RequestWithAuthz>();
  const permissions = request.authzPermissions;
  if (!permissions) {
    throw new UnauthorizedException('Permission context is missing');
  }

  return permissions;
});
