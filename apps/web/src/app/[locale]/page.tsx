import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations('home');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-5xl font-bold" style={{ color: 'var(--color-primary)' }}>
        {t('heroTitle')}
      </h1>
      <p className="max-w-xl text-lg opacity-80">{t('heroSubtitle')}</p>
      <a
        href="#contact"
        className="rounded-md px-6 py-3 font-semibold text-white"
        style={{ background: 'var(--color-primary)' }}
      >
        {t('cta')}
      </a>
    </main>
  );
}
