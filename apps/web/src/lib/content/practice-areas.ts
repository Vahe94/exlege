// Static V1 content (no CMS model). Title/description live in messages/hy.json under
// `practiceAreas.items.<slug>`; this file is the ordered list + category + icon binding.

export type PracticeCategory = 'business' | 'civil' | 'criminal';

export interface PracticeArea {
  slug: string;
  category: PracticeCategory;
  /** icon name resolved by components/ui/icon.tsx */
  icon: string;
}

export const PRACTICE_AREAS: PracticeArea[] = [
  { slug: 'corporate', category: 'business', icon: 'briefcase' },
  { slug: 'litigation', category: 'civil', icon: 'gavel' },
  { slug: 'realEstate', category: 'business', icon: 'building' },
  { slug: 'criminal', category: 'criminal', icon: 'shield' },
  { slug: 'family', category: 'civil', icon: 'users' },
  { slug: 'ip', category: 'business', icon: 'bulb' },
];

export const PRACTICE_CATEGORIES: ('all' | PracticeCategory)[] = [
  'all',
  'business',
  'civil',
  'criminal',
];
