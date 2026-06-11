import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';

type Variant = 'primary' | 'gold' | 'outline' | 'outlineLight';

// Sharp corners, no bounce — depth via color shift only (design system).
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container',
  gold: 'bg-secondary text-on-secondary hover:brightness-95',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-on-primary',
  outlineLight: 'border border-white/50 text-white hover:bg-white hover:text-primary',
};

const BASE =
  'inline-flex items-center justify-center gap-2 px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.05em] transition-colors duration-200 rounded-none';

export function Button({
  href,
  variant = 'primary',
  className = '',
  children,
  target,
  rel,
  type = 'button',
  onClick,
}: {
  href?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;
  if (href) {
    const external = href.startsWith('http');
    return (
      <Link
        href={href}
        className={cls}
        target={target ?? (external ? '_blank' : undefined)}
        rel={rel ?? (external ? 'noopener noreferrer' : undefined)}
      >
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
