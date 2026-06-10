import type { Role } from '@exlege/types';

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  tenantId: string;
  role: Role;
}

export interface AuthUser {
  userId: string;
  email: string;
  tenantId: string;
  role: Role;
}
