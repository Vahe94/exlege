import type { LocalizedString } from '@exlege/types';
import { DEFAULT_LOCALE } from '@exlege/types';

/** Pick a localized jsonb value for `locale`, falling back to default then any. */
export function localized(value: LocalizedString | null | undefined, locale: string): string {
  if (!value) return '';
  return value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value)[0] ?? '';
}
