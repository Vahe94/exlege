import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PublicPostDetail } from '@exlege/types';
import { getPublicPost } from '@/lib/api/posts';
import { Container } from '@/components/layout/container';
import { Icon } from '@/components/ui/icon';
import { PostContent } from '@/components/posts/post-content';
import { localized } from '@/lib/i18n';
import { formatDate } from '@/lib/format/date';
import { coverUrl } from '@/lib/image';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// fetch is request-memoized, so generateMetadata + page share one API call.
async function loadPost(slug: string): Promise<PublicPostDetail | null> {
  try {
    return await getPublicPost(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  const title = localized(post.title, locale);
  const description = localized(post.excerpt, locale) || undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/news/${slug}`,
      ...(post.coverImageKey ? { images: [coverUrl(slug)] } : {}),
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await loadPost(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'news' });
  const title = localized(post.title, locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    inLanguage: locale,
    datePublished: post.publishedAt ?? undefined,
    image: post.coverImageKey ? coverUrl(slug) : undefined,
    mainEntityOfPage: `${SITE_URL}/news/${slug}`,
  };

  return (
    <article className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="arrowRight" className="h-4 w-4 rotate-180" />
          {t('backToList')}
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.15em] text-secondary">
          {t('badge')}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-primary md:text-5xl">
          {title}
        </h1>
        {post.publishedAt ? (
          <time className="mt-4 block text-sm text-on-surface-variant">
            {formatDate(post.publishedAt)}
          </time>
        ) : null}
      </Container>

      {post.coverImageKey ? (
        <Container className="mt-10 max-w-4xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl(slug)}
            alt={title}
            className="aspect-[16/9] w-full object-cover"
          />
        </Container>
      ) : null}

      <Container className="mt-12 max-w-3xl">
        {post.excerpt ? (
          <p className="mb-10 border-l-2 border-secondary pl-6 font-display text-xl leading-relaxed text-on-surface-variant">
            {localized(post.excerpt, locale)}
          </p>
        ) : null}
        <PostContent content={post.content} locale={locale} />
      </Container>
    </article>
  );
}
