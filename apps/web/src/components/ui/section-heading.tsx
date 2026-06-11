import type { ReactNode } from 'react';

/** Eyebrow label (gold, uppercase, tracked) + display heading. */
export function SectionHeading({
  eyebrow,
  title,
  className = '',
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  className?: string;
  /** white text on dark sections */
  light?: boolean;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display text-3xl font-bold leading-tight md:text-5xl ${
          light ? 'text-white' : 'text-primary'
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
