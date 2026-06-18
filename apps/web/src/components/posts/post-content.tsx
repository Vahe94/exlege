import { DEFAULT_LOCALE } from '@exlege/types';

// Post `content` is jsonb keyed by locale. The admin currently writes the plain shape
// `{ text: string }` per locale (Tiptap rich editor lands later — see PROGRESS debt).
// This renderer handles that shape and degrades gracefully for a future Tiptap doc.

type Json = Record<string, unknown>;

function pickLocaleNode(content: unknown, locale: string): unknown {
  if (!content || typeof content !== 'object') return null;
  const map = content as Json;
  return map[locale] ?? map[DEFAULT_LOCALE] ?? Object.values(map)[0] ?? null;
}

/** Plain `{ text }` shape from the current admin editor. */
function asPlainText(node: unknown): string | null {
  if (node && typeof node === 'object' && typeof (node as Json).text === 'string') {
    return (node as Json).text as string;
  }
  return null;
}

/** Best-effort text extraction from a Tiptap-like doc (future-proofing). */
function extractTiptapText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Json;
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.content)) {
    const sep = n.type === 'paragraph' ? '\n\n' : '';
    return n.content.map(extractTiptapText).join('') + sep;
  }
  return '';
}

export function PostContent({ content, locale }: { content: unknown; locale: string }) {
  const node = pickLocaleNode(content, locale);
  if (!node) return null;

  const raw = asPlainText(node) ?? extractTiptapText(node);
  const paragraphs = raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className="space-y-6 text-lg leading-relaxed text-on-surface">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}
