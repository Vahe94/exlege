import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { PublicPostListItem } from '@exlege/types';
import { Container } from '../layout/container';
import { SectionHeading } from '../ui/section-heading';
import { Icon } from '../ui/icon';
import { localized } from '@/lib/i18n';
import { formatDate } from '@/lib/format/date';
import { coverUrl } from '@/lib/image';

export function RecentWins({ items, locale }: { items: PublicPostListItem[]; locale: string }) {
  const t = useTranslations('recentWins');
  if (items.length === 0) return null;

  return (
    <section className="bg-surface-container-low py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} />
        <p className="mt-6 max-w-2xl text-lg text-on-surface-variant">{t('subtitle')}</p>

        <div className="mt-12 grid grid-cols-1 gap-px border border-outline-variant bg-outline-variant md:grid-cols-3">
          {items.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col bg-surface-container-lowest transition-colors hover:bg-surface"
            >
              <div className="aspect-[16/10] overflow-hidden bg-primary-container">
                {post.coverImageKey ? (
                  // plain <img>: avoids next/image remote-domain config for the V1 local API
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl(post.slug)}
                    alt={localized(post.title, locale)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-8">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
                  {t('badge')}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-primary transition-colors group-hover:text-secondary">
                  <Link href={`/news/${post.slug}`}>{localized(post.title, locale)}</Link>
                </h3>
                {post.excerpt ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                    {localized(post.excerpt, locale)}
                  </p>
                ) : null}
                <div className="mt-auto flex items-center justify-between pt-6">
                  <time className="text-xs text-on-surface-variant">
                    {formatDate(post.publishedAt)}
                  </time>
                  <Link
                    href={`/news/${post.slug}`}
                    className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-secondary"
                  >
                    {t('readMore')}
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
