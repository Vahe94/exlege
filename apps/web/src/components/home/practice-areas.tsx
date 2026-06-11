'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '../layout/container';
import { SectionHeading } from '../ui/section-heading';
import { Icon } from '../ui/icon';
import {
  PRACTICE_AREAS,
  PRACTICE_CATEGORIES,
  type PracticeCategory,
} from '@/lib/content/practice-areas';

export function PracticeAreas() {
  const t = useTranslations('practiceAreas');
  const [active, setActive] = useState<'all' | PracticeCategory>('all');
  const areas = PRACTICE_AREAS.filter((a) => active === 'all' || a.category === active);

  return (
    <section id="practice-areas" className="scroll-mt-20 bg-surface py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />

        <div className="mt-8 flex flex-wrap gap-3">
          {PRACTICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`px-5 py-2 text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                active === cat
                  ? 'bg-primary text-on-primary'
                  : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px border border-outline-variant bg-outline-variant sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <article
              key={area.slug}
              className="group flex flex-col bg-surface-container-lowest p-8 transition-colors hover:bg-surface-container-low"
            >
              <Icon name={area.icon} className="h-8 w-8 text-secondary" />
              <h3 className="mt-6 font-display text-xl font-semibold text-primary">
                {t(`items.${area.slug}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                {t(`items.${area.slug}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
