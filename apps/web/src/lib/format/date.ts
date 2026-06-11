const HY_DATE = new Intl.DateTimeFormat('hy-AM', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** Format an ISO date string in Armenian (hy-AM). Empty string for null/invalid. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : HY_DATE.format(d);
}
