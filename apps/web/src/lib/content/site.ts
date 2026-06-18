// Site-level constants. User-facing labels resolve through i18n by key.

export interface NavItem {
  /** i18n key under `nav` */
  key: string;
  href: string;
}

export const NAV: NavItem[] = [
  { key: 'practiceAreas', href: '#practice-areas' },
  { key: 'news', href: '/news' },
  { key: 'videos', href: '/videos' },
  { key: 'about', href: '#about' },
];

/** Admin/workspace portal — external app. */
export const PORTAL_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';

export const FOUNDED_YEAR = 1994;
