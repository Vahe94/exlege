import { SetMetadata } from '@nestjs/common';
import type { Role } from '@exlege/types';

export const ROLES_KEY = 'roles';
/** Restrict endpoint to specific org roles, e.g. @Roles('OWNER', 'ADMIN') */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
