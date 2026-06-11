# ExLege — Progress Log

Maintained by Claude after every work session. Newest first.
**Vahe: check "Manual actions" first — that's your queue.**

## ⚠️ Manual actions for Vahe (pending)

1. **Rebuild shared types** — I added `PublicPostListItem`/`PublicPostDetail`/`Paginated` to `@exlege/types`. `dist/` is gitignored, so api/web need it rebuilt: `pnpm -F @exlege/types build` (or a full `pnpm build`). I already rebuilt it locally; this is for your machine.
2. **Web env** — create `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. **Run it** — `pnpm dev`, open http://localhost:3000. Hero + practice areas + about render from static i18n; "Recent wins" only appears once the API is up AND a `CASE_WIN` post is **published** (seed/admin). `next/font` fetches Noto fonts from Google on first build (needs network).
4. **Cover images** — to see a cover on a win card, publish a `CASE_WIN` post with an uploaded cover; it serves at `GET /api/public/posts/:slug/cover`.
5. Restart `pnpm dev` once — confirm `@exlege/api` still compiles clean (cover route added).
6. Commit when satisfied (suggested split): ① `feat(api): public cover-image route + public post wire types`, ② `feat(web): public homepage (hero, practice areas, recent wins, about) — hy, theme tokens, Noto Armenian fonts`.

_Verified in sandbox: `tsc` clean (api + web); **`pnpm -F @exlege/web build` succeeded** (`/hy` SSG+ISR, next/font fetched OK); rendered `next start` + Playwright screenshot at 1280 — hero/practice-areas/about/footer all correct, Armenian fonts render, RecentWins gracefully empty (no API). Only benign console 404s (favicon, `/news` prefetch — route not built yet)._
_**Sandbox CAN run pnpm/next now:** Node v24.16 is installed (nvm default 24) but this non-interactive shell pins PATH to v22.12 — prefix `PATH="/Users/vahe/.nvm/versions/node/v24.16.0/bin:$PATH"` and pnpm 11.5.3 works._
_Admin smoke-test passed clean (June 10)._

## Done

- ✅ Phase 0 complete: monorepo, DB, auth, tasks, reminders, notifications — verified on Vahe's machine (June 10).

---

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
