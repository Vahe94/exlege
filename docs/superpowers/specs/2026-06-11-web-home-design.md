# apps/web — Public Website (Home) — Design

**Date:** 2026-06-11
**Scope (this phase):** Homepage end-to-end + supporting foundation (theme tokens, fonts, API client, layout chrome) + a public cover-image API route. News list, post detail, and videos are **out of scope** this phase but the structure must accommodate them.

Source of truth for rules/stack: `CLAUDE.md`. Progress log: `PROGRESS.md`. Design reference: Stitch project "Legal Office Digital Suite" / theme "Lex Legacy" (Home/News/Videos Armenian light screens).

---

## Goals

- Production-grade Armenian-first public homepage matching the Stitch "Lex Legacy" design.
- SSR + ISR, schema.org markup, all strings via next-intl, zero hardcoded brand colors (theme via CSS vars, tenant-overridable later).
- Small, focused, independently-readable files. App-local components (no `packages/ui` yet — YAGNI; extract when a 2nd consumer appears).

## Non-goals (this phase)

- News list / post detail / videos pages (structure reserved, not built).
- Contact/lead form submission (component + `lib/api/leads.ts` deferred).
- Practice-area & About as CMS content — they are **static** (i18n + config) for V1.
- `packages/ui` shared package.

---

## Decisions (locked with Vahe)

| # | Decision |
|---|---|
| 1 | **Display font:** Noto Serif Armenian (600/700); **body:** Inter (400/600). Both via `next/font/google`. Playfair (design's serif) lacks Armenian glyphs → replaced. |
| 2 | **Practice Areas + About = static** content (next-intl `hy.json` + `lib/content/`). No new DB models. |
| 3 | **Cover images:** new API route **`GET /api/public/posts/:slug/cover`** streams a published post's cover via `StorageProvider`. Slug-based (not raw-key) so private documents / arbitrary keys are never exposed. Separate commit. |
| 4 | **Build scope:** Home only this phase. |
| 5 | **Components app-local** in `apps/web/src/components`. |

---

## Architecture

### Routing & rendering
- Existing next-intl setup kept: `localePrefix: 'as-needed'` (hy at `/`), `proxy.ts`, `[locale]` segment.
- Home is a **Server Component**. It fetches recent `CASE_WIN` posts server-side and composes presentational sections.
- ISR via `fetch(..., { next: { revalidate: 300 } })`. No client-side data libraries.
- `generateMetadata` per route; JSON-LD `LegalService` injected on Home.

### Data flow
```
page.tsx (server)
  └─ lib/api/posts.getPublicPosts({ type: 'CASE_WIN', pageSize: 3 })
       └─ lib/api/client.apiGet('/public/posts?...')  → fetch API, ISR
  └─ passes items to <RecentWins items={...}/> (presentational)
```
Practice areas: static array from `lib/content/practice-areas.ts` (slug + i18n key), rendered by `<PracticeAreas/>`. Hero / About-CTA: static strings from `hy.json`.

Cover image URL is derived from slug: `lib/image.coverUrl(slug)` → `${API_URL}/api/public/posts/${slug}/cover`. A list item renders its cover only when `coverImageKey != null`; otherwise a tonal placeholder.

### Folder structure
```
apps/web/src/
  app/[locale]/
    layout.tsx            # fonts + IntlProvider + <SiteHeader/> <MobileNav/> <SiteFooter/>
    page.tsx              # Home: fetch + compose + JSON-LD + generateMetadata
  app/globals.css         # Tailwind 4 @theme — full Stitch token ramp + font vars
  components/
    layout/
      container.tsx       # max-w-[1280px] + responsive gutter
      site-header.tsx     # fixed glass nav (desktop)
      mobile-nav.tsx      # bottom bar (mobile)
      site-footer.tsx     # navy 4-col footer + gold CTA
    home/
      hero.tsx            # dark hero, columns image, display headline, est.
      practice-areas.tsx  # static cards + filter tabs (visual-only this phase)
      recent-wins.tsx     # CASE_WIN cards (items prop)
      about-cta.tsx       # dark "global perspectives" section
    ui/
      button.tsx          # primary (navy/gold) / secondary (outline), sharp
      card.tsx            # 1px outline, sharp, generous padding
      section-heading.tsx # eyebrow label + display heading
    posts/                # (reserved) post-card shared by news+videos later
  lib/
    api/
      client.ts           # apiGet/apiPost: baseURL, ISR, error normalization
      posts.ts            # getPublicPosts, getPublicPost
    format/date.ts        # Intl hy-AM date formatter
    image.ts              # coverUrl(slug)
    fonts.ts              # Noto Serif Armenian + Inter (next/font/google)
    content/
      practice-areas.ts   # static list (slug + i18n key + icon)
      site.ts             # contact/address/nav route constants
  i18n/{routing,request}.ts · proxy.ts · messages/hy.json
```

### Theme tokens
Extend `globals.css` `@theme` with the **full Stitch token set**, named to match Stitch's Tailwind class names so markup translated from the Stitch HTML works with minimal change:

- `--color-primary #1e3a5f` (keep), `--color-primary-container`, `--color-on-primary`, `--color-on-primary-container`
- `--color-secondary` (gold) + container/on-variants
- `--color-surface`, `--color-surface-container-{lowest,low,DEFAULT,high,highest}`, `--color-surface-variant`
- `--color-on-surface`, `--color-on-surface-variant`
- `--color-outline`, `--color-outline-variant`
- `--font-display` (Noto Serif Armenian), `--font-body` (Inter)

Mapped Stitch → token (representative): `primary #1a2b3c`, `secondary #c5a059` (gold), `surface #fcf9f8`, `on-surface #1b1c1c`, `outline #74777d`, `outline-variant #c4c6cd`, surface-container ramp `#ffffff → #e4e2e1`. Existing brand vars (`--color-primary #1e3a5f`, `--color-accent #c9a227`) retained as the tenant-set values; the Stitch hexes are reconciled to them (close already). **No component hardcodes a hex** — utilities resolve to vars.

Shape: sharp (radius 0) — set as Tailwind default via theme; components use `rounded-none`/no radius.

### Shared types (`packages/types`)
Add plain (non-Prisma) shapes the web consumes, mirroring the public controller output:
```ts
export interface PublicPostListItem {
  id: string; type: PostType; slug: string;
  title: LocalizedString; excerpt: LocalizedString | null;
  coverImageKey: string | null; videoUrl: string | null;
  publishedAt: string | null; // ISO over the wire
}
export interface PublicPostDetail extends PublicPostListItem {
  content: unknown | null; // Tiptap JSON per locale
}
export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }
```
(API keeps its Prisma-payload aliases internally; these are the wire contract.)

### API cover route
`apps/api/src/posts/public-posts.controller.ts`:
```
@Public() @Get(':slug/cover')
cover(slug, @Res() res):
  tenantId = tenantContext.getDefaultTenantId()
  key = posts.publicCoverKey(tenantId, slug)   // 404 if no published post or no cover
  buffer = localStorage.get(key)
  res.setHeader Content-Type ← ext→mime
  res.setHeader Cache-Control: public, max-age=3600
  res.end(buffer)
```
`PostsService.publicCoverKey(tenantId, slug)`: find published post by slug, return `coverImageKey`, else `NotFoundException`. Inject `LocalStorageProvider` into the controller (same pattern as `DocumentsController`). Route declared so it doesn't collide with `:slug` detail (distinct depth). **Security:** only published posts; no key ever accepted from the client.

---

## Error handling
- `apiGet` throws a normalized error on non-2xx; Home treats a failed recent-wins fetch as "no wins" (renders nothing / graceful) rather than 500-ing the page. Log server-side.
- Missing cover (`coverImageKey == null`) → placeholder, no request.
- Cover route: 404 → next/image falls back to placeholder.

## Testing
- Vitest unit: `lib/format/date` (hy-AM), `lib/image.coverUrl`, `lib/api/client` error normalization (mock fetch).
- Playwright e2e (later, with news): home renders hero + sections, recent-wins shows seeded CASE_WIN.
- This phase ships unit tests for the pure `lib/*` helpers; full e2e lands with news.

## Env
- `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`) — used by both server fetch and (later) client lead form.

## Out-of-scope reminders (next phases)
- News list + post detail (+ Tiptap JSON→HTML renderer), videos list.
- Contact/lead form + `lib/api/leads.ts`.
- Rate limiting (`@nestjs/throttler`) on public endpoints before prod.
</content>
</invoke>
