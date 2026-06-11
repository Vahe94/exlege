import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { fontBody, fontDisplay } from '@/lib/fonts';
import { SiteHeader } from '@/components/layout/site-header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { SiteFooter } from '@/components/layout/site-footer';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Ex Lège',
  description: 'Իրավաբանական գրասենյակ',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="min-h-screen">
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="pt-20 pb-20 md:pb-0">{children}</main>
          <SiteFooter />
          <MobileNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
