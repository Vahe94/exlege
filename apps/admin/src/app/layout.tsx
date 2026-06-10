import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExLege Admin',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <body>{children}</body>
    </html>
  );
}
