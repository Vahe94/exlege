import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next 16: `middleware.ts` is deprecated in favor of `proxy.ts` (Node runtime).
// NOTE: multi-tenant host→tenant resolution gets added here later (Vercel Platforms pattern).
const handleIntl = createIntlMiddleware(routing);

export default function proxy(request: Parameters<typeof handleIntl>[0]) {
  return handleIntl(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
