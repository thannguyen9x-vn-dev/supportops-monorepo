import { Global, Module } from '@nestjs/common';
import { TenantModule } from '../../tenant/tenant.module';

@Global()
@Module({
  imports: [TenantModule],
  exports: [TenantModule],
})
export class TenantCoreModule {}
