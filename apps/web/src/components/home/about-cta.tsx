import { useTranslations } from 'next-intl';
import { Container } from '../layout/container';
import { Button } from '../ui/button';

const STATS = ['cases', 'years', 'attorneys'] as const;

export function AboutCta() {
  const t = useTranslations('about');
  return (
    <section id="about" className="scroll-mt-20 bg-primary py-24 text-white md:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
              {t('eyebrow')}
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight md:text-5xl">
              {t('title')}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/75">{t('body')}</p>
            <Button href="#contact" variant="gold" className="mt-10">
              {t('cta')}
            </Button>
          </div>

          <dl className="grid grid-cols-3 gap-px border border-white/15 bg-white/15">
            {STATS.map((key) => (
              <div key={key} className="bg-primary px-4 py-10 text-center">
                <dt className="sr-only">{t(`stats.${key}.label`)}</dt>
                <dd>
                  <span className="block font-display text-4xl font-bold text-secondary md:text-5xl">
                    {t(`stats.${key}.value`)}
                  </span>
                  <span className="mt-2 block text-xs uppercase tracking-[0.1em] text-white/60">
                    {t(`stats.${key}.label`)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
