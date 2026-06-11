import type { ReactNode } from 'react';

/** Centered editorial column: 1280px max, responsive horizontal margins. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-5 md:px-16 ${className}`}>{children}</div>
  );
}
