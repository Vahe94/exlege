# Handover — next session kickoff prompt

> Paste the block below into a fresh session. It assumes zero prior context.

---

Read `CLAUDE.md` and `PROGRESS.md` first — source of truth (rules, locked stack, progress log, my manual-actions queue). Obey RULES strictly. Recall memory: **never `git commit` or `git push` unless I explicitly say so — I review and commit myself.** Supervisor mode (no flattery, push back when I'm wrong). Caveman mode active. Latest-stable deps policy.

## Where we are
- Public homepage (`apps/web`) **built** this session — see `PROGRESS.md` 2026-06-11 and spec `docs/superpowers/specs/2026-06-11-web-home-design.md`. Typechecks clean (api + web). **Uncommitted** — I review/commit (see PROGRESS manual actions for the suggested commit split + env setup).
- Backend feature-complete for V1; admin UI complete; homepage done.
- Stitch designs already pulled: project "Legal Office Digital Suite" / theme "Lex Legacy". Public Armenian screens: **News list** (`b1da…404a`), **Videos/Resources list** (`bf27…e463`), Home (done). No post-detail / contact screen exists — derive from the system.

## Established conventions (follow them)
- Components **app-local** in `apps/web/src/components/{layout,ui,home,posts}` — no `packages/ui` yet.
- Theme = CSS vars in `apps/web/src/app/globals.css` (`@theme inline`, full Stitch token ramp, sharp radius 0). **Never hardcode brand hex.**
- Fonts: Noto Serif Armenian (display) + Noto Sans Armenian (body) via `lib/fonts.ts`.
- Data: server components + `lib/api/client.ts` (ISR `revalidate:300`, `ApiError`) → `lib/api/posts.ts`. Localized jsonb via `lib/i18n.ts` `localized(value, locale)`. Dates via `lib/format/date.ts`. Cover URL via `lib/image.ts` `coverUrl(slug)`.
- All strings via next-intl `messages/hy.json`. Icons: inline SVG in `components/ui/icon.tsx` (add new paths there).

## This session's goal: News (list + post detail) + Videos list
1. **News list** `app/[locale]/news/page.tsx` — paginated `GET /api/public/posts?type=NEWS` (+ section filter tabs per design), featured + article rows, pagination. Build a shared `components/posts/post-card.tsx`.
2. **Post detail** `app/[locale]/news/[slug]/page.tsx` — `getPublicPost(slug)`; `generateMetadata` + JSON-LD `Article`. **Needs a Tiptap JSON→HTML renderer** (`content` is Tiptap JSON per locale, not a string). Decide: `@tiptap/html` `generateHTML` server-side vs a small custom renderer. Flag deps.
3. **Videos list** `app/[locale]/videos/page.tsx` — `type=VIDEO`, thumbnail grid, category chips, embed handling for `videoUrl`.

## API contracts (no auth; tenant via `DEFAULT_TENANT_SLUG`)
- `GET /api/public/posts?type=NEWS|CASE_WIN|VIDEO&page&pageSize` → `Paginated<PublicPostListItem>` (types in `@exlege/types`).
- `GET /api/public/posts/:slug` → `PublicPostDetail` (adds `content`).
- `GET /api/public/posts/:slug/cover` → image bytes (published only). **New this session.**
- `POST /api/public/leads` → `{name, phone, email?, message?}` (contact form, still unbuilt).

## Open debt
1. **Tiptap JSON→HTML renderer** — required for post detail (above).
2. Hero uses a CSS gradient, no photo — drop a real columns photo at `apps/web/public/` and wire it when you have one.
3. Contact/lead form + `lib/api/leads.ts` not built (homepage CTAs point to `#contact` anchor — no section yet).
4. `@nestjs/throttler` on public endpoints before prod. Tests: unit for `lib/*` (date/image/i18n/client) + Playwright e2e.
5. Admin debt (unchanged): refresh token localStorage → httpOnly cookie; textarea → Tiptap.

## Env reminders
- My machine: local Postgres (pgAdmin), runs dev servers. Docker compose: Postgres :5433, Redis :6379. admin :3001, api :4000, web :3000. Web env in `apps/web/.env.local` (see PROGRESS).
- Your sandbox: no network to my localhost, but general internet works. **You CAN run pnpm/next/build** — the default shell pins Node v22.12, but v24.16 is installed (nvm default 24); prefix `PATH="/Users/vahe/.nvm/versions/node/v24.16.0/bin:$PATH"` → pnpm 11.5.3 + `next build`/`next start` all work. Use it to actually build + Playwright-screenshot pages, not just `tsc`. `dist/` of packages is gitignored; rebuild `@exlege/types` after editing its `src`.
- Seed admin: `admin@exlege.local` / `ChangeMe123!`
