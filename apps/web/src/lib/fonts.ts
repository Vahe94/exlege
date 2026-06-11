import { Noto_Sans_Armenian, Noto_Serif_Armenian } from 'next/font/google';

// Display serif — Playfair Display (the Stitch design's serif) has no Armenian glyphs,
// so the hy-first site uses Noto Serif Armenian for the same editorial role.
export const fontDisplay = Noto_Serif_Armenian({
  subsets: ['armenian'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

// Body sans — Inter likewise lacks an Armenian subset; Noto Sans Armenian is its
// neutral-sans counterpart with proper Armenian coverage.
export const fontBody = Noto_Sans_Armenian({
  subsets: ['armenian'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});
