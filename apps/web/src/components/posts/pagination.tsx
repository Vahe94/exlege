import Link from 'next/link';

/** Page navigation. Pure presentational — builds `${basePath}?page=N`. */
export function Pagination({
  basePath,
  page,
  total,
  pageSize,
  prevLabel,
  nextLabel,
}: {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
  prevLabel: string;
  nextLabel: string;
}) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (lastPage <= 1) return null;

  const href = (p: number) => (p <= 1 ? basePath : `${basePath}?page=${p}`);
  const linkCls =
    'flex h-10 min-w-10 items-center justify-center border border-outline-variant px-3 text-sm font-semibold transition-colors';
  const disabled = 'cursor-not-allowed text-on-surface-variant/40 border-outline-variant/40';
  const enabled = 'text-primary hover:bg-primary hover:text-on-primary';

  return (
    <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${linkCls} ${enabled}`} rel="prev">
          {prevLabel}
        </Link>
      ) : (
        <span className={`${linkCls} ${disabled}`}>{prevLabel}</span>
      )}

      {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`${linkCls} ${
            p === page ? 'bg-primary text-on-primary' : 'text-primary hover:bg-surface-container'
          }`}
        >
          {p}
        </Link>
      ))}

      {page < lastPage ? (
        <Link href={href(page + 1)} className={`${linkCls} ${enabled}`} rel="next">
          {nextLabel}
        </Link>
      ) : (
        <span className={`${linkCls} ${disabled}`}>{nextLabel}</span>
      )}
    </nav>
  );
}
