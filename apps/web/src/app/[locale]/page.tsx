import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { PublicPostListItem } from '@exlege/types';
import { getPublicPosts } from '@/lib/api/posts';
import { Hero } from '@/components/home/hero';
import { PracticeAreas } from '@/components/home/practice-areas';
import { RecentWins } from '@/components/home/recent-wins';
import { AboutCta } from '@/components/home/about-cta';
import { Contact } from '@/components/home/contact';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    openGraph: {
      title: t('homeTitle'),
      description: t('homeDescription'),
      type: 'website',
      url: SITE_URL,
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let wins: PublicPostListItem[] = [];
  try {
    const res = await getPublicPosts({ type: 'CASE_WIN', pageSize: 3 });
    wins = res.items;
  } catch {
    // API unreachable / no data — render the page without the wins section
    wins = [];
  }

  const t = await getTranslations({ locale, namespace: 'meta' });
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: t('orgName'),
    description: t('homeDescription'),
    url: SITE_URL,
    areaServed: 'AM',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Երևան',
      addressCountry: 'AM',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <PracticeAreas />
      <RecentWins items={wins} locale={locale} />
      <AboutCta />
      <Contact />
    </>
  );
}
