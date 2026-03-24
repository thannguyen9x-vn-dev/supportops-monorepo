import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TenantContext } from '../../modules/tenant/tenant.context';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContext) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const raw = req.headers['x-tenant-id'];
    const tenantId =
      typeof raw === 'string' && UUID_REGEX.test(raw) ? raw : undefined;
    this.tenantContext.run({ tenantId }, () => next());
  }
}
