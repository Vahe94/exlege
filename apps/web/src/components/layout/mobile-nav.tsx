import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icon } from '../ui/icon';
import { PORTAL_URL } from '@/lib/content/site';

const ITEMS = [
  { key: 'home', href: '/', icon: 'home', external: false },
  { key: 'practiceAreas', href: '#practice-areas', icon: 'grid', external: false },
  { key: 'news', href: '/news', icon: 'bell', external: false },
  { key: 'portal', href: PORTAL_URL, icon: 'user', external: true },
] as const;

/** Bottom navigation bar (mobile only). */
export function MobileNav() {
  const t = useTranslations('nav');
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/30 bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden">
      {ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          className="flex flex-col items-center gap-1 text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name={item.icon} className="h-5 w-5" />
          <span className="text-[11px] font-semibold">{t(item.key)}</span>
        </Link>
      ))}
    </nav>
  );
}
