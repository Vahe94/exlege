import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Container } from './container';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { FOUNDED_YEAR, PORTAL_URL } from '@/lib/content/site';

function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.1em] text-white/60">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((label) => (
          <li key={label}>
            <Link href="#" className="text-sm text-white/80 transition-colors hover:text-secondary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const t = useTranslations('footer');
  const firmLinks = t.raw('firm.links') as string[];
  const serviceLinks = t.raw('services.links') as string[];
  const legal = t.raw('legal') as string[];

  return (
    <footer className="w-full border-t border-primary-container bg-primary text-white">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-2xl font-bold">{t('siteName')}</p>
            <p className="mt-4 max-w-xs text-sm text-white/70">{t('tagline')}</p>
            <Button href={PORTAL_URL} variant="gold" className="mt-6">
              {t('portalCta')}
            </Button>
          </div>

          <div className="md:col-span-2">
            <LinkColumn title={t('firm.title')} links={firmLinks} />
          </div>
          <div className="md:col-span-3">
            <LinkColumn title={t('services.title')} links={serviceLinks} />
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.1em] text-white/60">
              {t('contact.title')}
            </h3>
            <address className="space-y-3 text-sm not-italic text-white/80">
              <p className="flex items-start gap-3">
                <Icon name="mapPin" className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <span>
                  {t('contact.addressLine1')}
                  <br />
                  {t('contact.addressLine2')}
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Icon name="phone" className="h-5 w-5 shrink-0 text-secondary" />
                <a href={`tel:${t('contact.phone')}`} className="hover:text-secondary">
                  {t('contact.phone')}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {t('siteName')}. {t('rights')}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((label) => (
              <li key={label}>
                <Link href="#" className="transition-colors hover:text-secondary">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-xs text-white/40">{t('established', { year: FOUNDED_YEAR })}</p>
      </Container>
    </footer>
  );
}
