import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marks an endpoint as accessible without authentication. Use sparingly. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
