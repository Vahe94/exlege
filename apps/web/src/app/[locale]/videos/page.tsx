import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Paginated, PublicPostListItem } from '@exlege/types';
import { getPublicPosts } from '@/lib/api/posts';
import { Container } from '@/components/layout/container';
import { VideoCard } from '@/components/posts/video-card';
import { Pagination } from '@/components/posts/pagination';

const PAGE_SIZE = 9;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'videos' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function VideosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const t = await getTranslations({ locale, namespace: 'videos' });

  let data: Paginated<PublicPostListItem> = { items: [], total: 0, page, pageSize: PAGE_SIZE };
  try {
    data = await getPublicPosts({ type: 'VIDEO', page, pageSize: PAGE_SIZE });
  } catch {
    // API unreachable — render the empty state
  }

  return (
    <Container className="py-16 md:py-24">
      <header className="border-b border-outline-variant/30 pb-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-secondary">
          {t('eyebrow')}
        </p>
        <h1 className="font-display text-4xl font-bold text-primary md:text-5xl">{t('title')}</h1>
        <p className="mt-4 max-w-2xl text-lg text-on-surface-variant">{t('subtitle')}</p>
      </header>

      {data.items.length === 0 ? (
        <p className="py-24 text-center text-on-surface-variant">{t('empty')}</p>
      ) : (
        <>
          <div className="mt-12 grid grid-cols-1 gap-px border border-outline-variant bg-outline-variant sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((post) => (
              <VideoCard key={post.id} post={post} locale={locale} badge={t('badge')} />
            ))}
          </div>
          <Pagination
            basePath="/videos"
            page={data.page}
            total={data.total}
            pageSize={data.pageSize}
            prevLabel={t('prev')}
            nextLabel={t('next')}
          />
        </>
      )}
    </Container>
  );
}
