import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// NOTE: multi-tenant host→tenant resolution gets added here later (Vercel Platforms pattern)
export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
