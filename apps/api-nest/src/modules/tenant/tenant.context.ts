import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantStore {
  tenantId?: string;
  userId?: string;
}

@Injectable()
export class TenantContext {
  private readonly storage = new AsyncLocalStorage<TenantStore>();

  run<T>(store: TenantStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  getStore(): TenantStore | undefined {
    return this.storage.getStore();
  }

  getTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }
}
