import Link from 'next/link';
import type { PublicPostListItem } from '@exlege/types';
import { Icon } from '../ui/icon';
import { localized } from '@/lib/i18n';
import { formatDate } from '@/lib/format/date';
import { coverUrl } from '@/lib/image';

/** Vertical post card — shared by news (and videos later). */
export function PostCard({
  post,
  locale,
  hrefBase,
  badge,
  readMore,
}: {
  post: PublicPostListItem;
  locale: string;
  hrefBase: string;
  badge: string;
  readMore: string;
}) {
  const href = `${hrefBase}/${post.slug}`;
  const title = localized(post.title, locale);
  return (
    <article className="group flex flex-col bg-surface-container-lowest transition-colors hover:bg-surface">
      <Link href={href} className="block aspect-[16/10] overflow-hidden bg-primary-container">
        {post.coverImageKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl(post.slug)}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-8">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
          {badge}
        </span>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-primary transition-colors group-hover:text-secondary">
          <Link href={href}>{title}</Link>
        </h3>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
            {localized(post.excerpt, locale)}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-6">
          <time className="text-xs text-on-surface-variant">{formatDate(post.publishedAt)}</time>
          <Link
            href={href}
            className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-secondary"
          >
            {readMore}
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
