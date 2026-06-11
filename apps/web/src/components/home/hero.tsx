import { useTranslations } from 'next-intl';
import { Container } from '../layout/container';
import { Button } from '../ui/button';
import { FOUNDED_YEAR } from '@/lib/content/site';

export function Hero() {
  const t = useTranslations('home.hero');
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-primary text-white">
      {/* tonal depth + faint architectural grid (no photo dependency) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-primary-container via-primary to-primary-deep"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px)] [background-size:80px_100%]"
      />
      <div aria-hidden className="absolute inset-x-0 top-20 h-px bg-white/10" />

      <Container className="relative py-24">
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          {t('eyebrow', { year: FOUNDED_YEAR })}
        </p>
        <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
          {t('title')}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75">{t('subtitle')}</p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Button href="#contact" variant="gold">
            {t('ctaPrimary')}
          </Button>
          <Button href="#practice-areas" variant="outlineLight">
            {t('ctaSecondary')}
          </Button>
        </div>
      </Container>
    </section>
  );
}
