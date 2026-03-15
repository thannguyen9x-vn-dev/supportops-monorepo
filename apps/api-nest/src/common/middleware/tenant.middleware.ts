import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TenantContext } from '../../modules/tenant/tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContext) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const tenantId = typeof req.headers['x-tenant-id'] === 'string' ? req.headers['x-tenant-id'] : undefined;
    this.tenantContext.run({ tenantId }, () => next());
  }
}
