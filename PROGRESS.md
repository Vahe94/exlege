# ExLege — Progress Log

Maintained by Claude after every work session. Newest first.
**Vahe: check "Manual actions" first — that's your queue.**

## ⚠️ Manual actions for Vahe (pending)

0. **Reseed to fix admin login** — `pnpm db:seed`. The seed previously used `update: {}`, so the owner password was never reset after the first seed → admin login 401'd. Fixed: seed now resets `passwordHash` on every run (commit as `fix(db): reset owner password on reseed`). Log in with `.env` `SEED_OWNER_PASSWORD` (default `ChangeMe123!`). _(Seed IS wired — `prisma.config.ts` → `migrations.seed`, not package.json.)_
1. **Commit the news + videos work** — uncommitted: `apps/web/messages/hy.json`, `src/components/ui/icon.tsx`, `src/lib/content/site.ts`, `packages/db/prisma/seed.ts` (modified) + new `src/app/[locale]/news/`, `src/app/[locale]/videos/`, `src/components/posts/`, `src/lib/video.ts`. Suggested: `feat(web): public news + videos (list + detail)` + the seed fix above.
2. **See it with data** — `pnpm dev`, publish a few `NEWS` and `VIDEO` posts (admin; give videos a YouTube/Vimeo `videoUrl`). `/news` + `/videos` → grids + pagination; click a card → detail. News/video detail render the admin content shape `{hy:{text}}` as paragraphs (no Tiptap yet); video detail embeds the player. Unknown slug → 404.

_Homepage committed by Vahe as `c49d1ae` (no env/types changes outstanding — `.env.local` + `@exlege/types` rebuild already handled)._
_Verified in sandbox: `tsc` + `next build` clean (all 4 news/videos routes server-render). Ran `next start` against a stub API + Playwright @1280 — **news** list grid (cards, gold badges, dates, read-more), pagination (1/2 + next) and detail (back link, cover band, gold-rule excerpt, multi-paragraph content) all correct. **Videos** routes 200 but not screenshotted (YouTube iframe exceeds the 5s screenshot cap); reuses the verified news primitives._
_**Sandbox CAN run pnpm/next:** Node v24.16 installed (nvm default 24) but this shell pins PATH to v22.12 — prefix `PATH="/Users/vahe/.nvm/versions/node/v24.16.0/bin:$PATH"`._
_Admin smoke-test passed clean (June 10)._

## Done

- ✅ Phase 0 complete: monorepo, DB, auth, tasks, reminders, notifications — verified on Vahe's machine (June 10).

---

## 2026-06-11 — Session 4 (public website: news + videos)

Built the News and Videos sections on the homepage's established architecture (app-local components, CSS-var theme, server components + ISR, next-intl).

**Finding:** admin saves post `content` as `{ <locale>: { text: string } }` (plain), **not Tiptap JSON** — so the planned Tiptap→HTML renderer is premature. Built `PostContent` to render the current `{text}` shape as paragraphs (splits on blank lines), with a graceful fallback that text-extracts a future Tiptap doc. Real Tiptap renderer stays deferred with the admin Tiptap editor.

**Scope:** `/news` = `type=NEWS` only (CASE_WIN already featured on home; no content-category model, so the design's section sub-filter is omitted for V1).

**apps/web**
- `components/posts/post-card.tsx` — shared vertical card (cover/badge/title/excerpt/date/read-more), reusable by videos later.
- `components/posts/pagination.tsx` — `?page=N` nav, hides when ≤1 page.
- `components/posts/post-content.tsx` — locale-aware content renderer (`{text}` → paragraphs; Tiptap-doc fallback).
- `app/[locale]/news/page.tsx` — server, reads `?page`, `getPublicPosts({type:'NEWS',pageSize:9})`, hairline card grid + pagination, graceful empty state, `generateMetadata`.
- `app/[locale]/news/[slug]/page.tsx` — server, `getPublicPost(slug)` (request-memoized across metadata+page), `notFound()` on miss, cover band + gold-rule excerpt + `PostContent`, JSON-LD `Article`, OG metadata.

**Videos**
- `lib/video.ts` — `videoEmbedUrl()` maps YouTube/Vimeo watch URLs → embeddable player URL (null if unsupported).
- `components/posts/video-card.tsx` — thumbnail + play-overlay card → player page.
- `app/[locale]/videos/page.tsx` — `type=VIDEO` grid + pagination (mirrors news). (Design's category chips omitted — no content-category model in V1.)
- `app/[locale]/videos/[slug]/page.tsx` — player page: 16:9 `<iframe>` embed (falls back to cover + "watch external" button if URL not embeddable), excerpt + `PostContent`, JSON-LD `VideoObject`.
- Added `videos` to desktop `NAV` + `play` icon. `messages/hy.json` — `news.*` + `videos.*` + `nav.videos` keys.

**Note:** videos verified via `next build` (routes 200) but not screenshotted — the YouTube `<iframe>` keeps the page network-busy past the Playwright screenshot's 5s cap. Components reuse the screenshot-verified news primitives (same grid/detail), so visual risk is low.

**Deferred (next):** contact/lead form (`lib/api/leads.ts` — homepage/footer CTAs still point at `#contact` with no section yet); Tiptap renderer + admin editor; `@nestjs/throttler` on public endpoints; unit tests (`lib/*`: date/image/i18n/video/client) + Playwright e2e.

## 2026-06-11 — Session 3 (public website: homepage)

Pulled Stitch designs (project "Legal Office Digital Suite" / theme "Lex Legacy"): Home, News, Videos (Armenian, light). Mapped the design system to CSS-var theme tokens. Brainstormed + agreed `apps/web` architecture (spec: `docs/superpowers/specs/2026-06-11-web-home-design.md`), then built the homepage.

**Decisions (with Vahe):** Noto Serif Armenian display + Noto Sans Armenian body (design's Playfair/Inter lack Armenian glyphs); Practice Areas + About are **static** i18n (no CMS model); cover images via a new public API route; components **app-local** (no `packages/ui` yet); Home only this session.

**API**
- `GET /api/public/posts/:slug/cover` (`public-posts.controller.ts`) — streams a **published** post's cover via `STORAGE_PROVIDER` interface. Slug-based on purpose: client never passes a storage key → private documents / arbitrary files can't be read. `PostsService.publicCoverKey()` resolves the key or 404s. Cache-Control 1h.

**packages/types**
- Added wire contracts `PublicPostListItem`, `PublicPostDetail`, `Paginated<T>` (plain shapes; API keeps Prisma payload aliases internally).

**apps/web (homepage)**
- Theme: `globals.css` extended to the full Stitch token ramp (primary/-container/-deep, secondary gold, surface-container 1–5, outline/-variant, on-surface/-variant) as CSS vars → Tailwind v4 `@theme inline`; sharp (radius 0); tenant-overridable. Zero hardcoded brand hex outside the token block.
- Fonts: `lib/fonts.ts` next/font Noto Serif/Sans Armenian (`armenian` subset) → `--font-display`/`--font-body`.
- Data: `lib/api/client.ts` (ISR fetch, ApiError), `lib/api/posts.ts`, `lib/image.ts` (cover URL by slug), `lib/format/date.ts` (hy-AM), `lib/i18n.ts` (`localized()`), `lib/content/{practice-areas,site}.ts` (static).
- Components: `layout/{container,site-header,mobile-nav,site-footer}`, `ui/{button,card,section-heading,icon}` (inline thin-stroke SVG icons, no dep), `home/{hero,practice-areas,recent-wins,about-cta}`.
- Page: `[locale]/page.tsx` server component — fetches recent `CASE_WIN` (graceful empty on failure), JSON-LD `LegalService`, `generateMetadata`. Layout wires fonts + header/footer/mobile-nav. Full `hy.json` (all strings via next-intl).
- Hero is CSS-driven navy gradient (no photo dependency) — drop a real columns photo later.

**Deferred (next):** news list + post detail (+ Tiptap JSON→HTML renderer), videos list, contact/lead form (`lib/api/leads.ts`), `@nestjs/throttler` on public endpoints, unit tests for `lib/*` + Playwright e2e.

## 2026-06-10 — Session 2 (fix: api TS build errors)

`nest start --watch` emitted 22 errors (admin/api still ran on prior build; surfaced on rebuild):
- **21× TS2742** — service/controller methods returned inferred Prisma payload types whose
  home is `packages/db/node_modules/@prisma/client/runtime/client`; that path is outside
  `apps/api`, so TS can't name it portably. Note: fires on type-check, *not* gated by
  `declaration` (confirmed). Adding `@prisma/client` as a direct api dep does NOT help —
  pnpm resolves it to the same store realpath, still outside the project.
  **Fix:** explicit return-type annotations using named types from `@exlege/db`
  (model types `Case/Post/Notification/Document`, `Prisma.*GetPayload<…>` for select/include
  shapes). Exported the payload aliases from `posts.service` so the controllers can name them
  too (private aliases re-expand to the runtime path → still leak).
- **1× TS2322** — `auth.module` JWT `expiresIn`: env string not assignable to
  `number | StringValue`. Cast via `JwtSignOptions['expiresIn']` (no `ms` dep — unresolvable
  from api under strict pnpm).
- Verified: `tsc -p tsconfig.build.json` → 0 errors.

## 2026-06-10 — Session 1

### Foundation (Phase 0)
- Wiped Vite coming-soon SPA (preserved in git history; `assets/justice.png` kept)
- Turborepo + pnpm 11: `apps/web` (Next 16, next-intl, Armenian-first, Tailwind 4.3), `apps/admin` (Next 16, :3001), `apps/api` (NestJS 11, :4000), `packages/db|types|config`
- Prisma 7 schema: Tenant, User, Membership, RefreshToken, Case, Task, Reminder, Notification, Document, Post, Lead — `tenantId` everywhere, localized fields as jsonb
- docker-compose: Postgres :5433, Redis :6379. DB migrated + seeded
- Upgraded everything to latest majors (Rule 3); TS pinned 5.9 (Prisma/Nest not TS6-ready); Node 24 LTS
- `.claude/agents/`: code-reviewer, qa

### API features built
- **Auth**: login/refresh/logout; argon2; 15m JWT access ({userId, email, tenantId, role}); single-use rotating refresh tokens (sha256 in DB, 30d); global AuthGuard (everything requires auth unless `@Public()`); RolesGuard; ZodValidationPipe
- **Tasks**: tenant-scoped CRUD, due dates, priorities, `reminderOffsets` (minutes before dueAt) → Reminder rows; pagination + filters; case/assignee tenant validation
- **Reminders**: BullMQ repeatable scan (60s, `upsertJobScheduler` = idempotent); due reminders → in-app Notifications (assignee, fallback creator); DONE tasks consume silently
- **Notifications**: list / unread-count / mark read / mark all read
- **Cases**: tenant-scoped CRUD (status OPEN/ON_HOLD/CLOSED)
- **Documents**: multipart upload → StorageProvider (local disk, tenant-prefixed UUID keys), 25MB limit, list/get, HMAC-signed expiring download URLs (5 min), delete (storage + DB, OWNER/ADMIN/ATTORNEY)
- **Posts**: CRUD (localized jsonb title/excerpt/content), slug unique per tenant, DRAFT/PUBLISHED + publish endpoint; public endpoints serve only PUBLISHED
- **Leads**: public submission endpoint (no auth), admin list + status updates
- **Public tenant resolution (V1)**: public endpoints resolve tenant via `DEFAULT_TENANT_SLUG` env (single-tenant simplification; replaced by host→tenant middleware in multi-tenant phase)

### Admin UI built (apps/admin, :3001)
- API client: in-memory access token, auto-refresh on 401 (single retry), redirect to /login on auth failure
- Login page; protected (app) layout with sidebar nav, unread-notifications badge (30s poll), logout
- Pages: Dashboard (open tasks / new leads / unread counts + upcoming deadlines), Tasks (create with due date + reminder offsets, filter, mark done, delete), Cases (create, search, inline status change), Documents (upload, signed download, delete), Posts (create draft hy-content, publish/unpublish, delete), Leads (list, status change), Notifications (list, mark read/all)
- All strings via next-intl hy.json; dates via Intl hy-AM
- Debt: refresh token in localStorage (httpOnly cookie later); plain-textarea post content (Tiptap later); shared UI not yet in packages/ui

### Known debt / next up
- Rate limiting on public endpoints (@nestjs/throttler) — before prod
- Email channel for reminders (Resend/SES) — Phase 1 polish
- ESLint flat config (Next 16 dropped `next lint`)
- Tests (vitest units for auth/reminders/storage; Playwright e2e) — next session
- Admin UI (login, tasks board, documents, posts editor) — next big block
- Web UI (homepage, news) — after admin
