import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Container } from './container';
import { Icon } from '../ui/icon';
import { NAV, PORTAL_URL } from '@/lib/content/site';

/** Fixed glass navigation (desktop). Mobile uses the bottom bar (MobileNav). */
export function SiteHeader() {
  const t = useTranslations();
  return (
    <header className="fixed top-0 z-50 h-20 w-full border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md">
      <Container className="flex h-full items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-primary">
          {t('common.siteName')}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-semibold text-on-surface transition-colors hover:text-secondary"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label={t('common.search')}
            className="hidden text-on-surface-variant transition-colors hover:text-primary md:block"
          >
            <Icon name="search" className="h-5 w-5" />
          </button>
          <span className="hidden text-sm font-semibold text-on-surface-variant md:inline">
            {t('common.langLabel')}
          </span>
          <Link
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
          >
            {t('nav.portal')}
          </Link>
        </div>
      </Container>
    </header>
  );
}
