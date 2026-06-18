import Link from 'next/link';
import type { PublicPostListItem } from '@exlege/types';
import { Icon } from '../ui/icon';
import { localized } from '@/lib/i18n';
import { formatDate } from '@/lib/format/date';
import { coverUrl } from '@/lib/image';

/** Video card — thumbnail with a play overlay, links to the player page. */
export function VideoCard({
  post,
  locale,
  badge,
}: {
  post: PublicPostListItem;
  locale: string;
  badge: string;
}) {
  const href = `/videos/${post.slug}`;
  const title = localized(post.title, locale);
  return (
    <article className="group flex flex-col bg-surface-container-lowest transition-colors hover:bg-surface">
      <Link
        href={href}
        className="relative block aspect-video overflow-hidden bg-primary-container"
      >
        {post.coverImageKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl(post.slug)}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center bg-primary/80 text-white transition-colors group-hover:bg-secondary group-hover:text-on-secondary">
            <Icon name="play" className="h-7 w-7 translate-x-0.5" />
          </span>
        </span>
      </Link>
      <div className="p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary">
          {badge}
        </span>
        <h3 className="mt-3 font-display text-xl font-semibold leading-tight text-primary transition-colors group-hover:text-secondary">
          <Link href={href}>{title}</Link>
        </h3>
        <time className="mt-3 block text-xs text-on-surface-variant">
          {formatDate(post.publishedAt)}
        </time>
      </div>
    </article>
  );
}
