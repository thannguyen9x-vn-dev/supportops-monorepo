import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionsRequirement {
  all?: string[];
  any?: string[];
}

export const Permissions = (requirement: PermissionsRequirement): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERMISSIONS_KEY, requirement);
