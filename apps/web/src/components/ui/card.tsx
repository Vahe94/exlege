import type { ReactNode } from 'react';

/** Embossed card: 1px outline, sharp corners, generous padding (design system). */
export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article';
}) {
  return (
    <Tag
      className={`border border-outline-variant bg-surface-container-lowest p-8 transition-colors duration-200 ${className}`}
    >
      {children}
    </Tag>
  );
}
