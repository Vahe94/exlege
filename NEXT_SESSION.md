# Handover — next session kickoff prompt

> Paste the block below into a fresh session. It assumes zero prior context.

---

Read `CLAUDE.md` and `PROGRESS.md` first — source of truth (rules, locked stack, progress log, my manual-actions queue). Obey RULES strictly. Recall memory: **never `git commit` or `git push` unless I explicitly say so — I review and commit myself.** Supervisor mode (no flattery, push back when I'm wrong). Caveman mode active. Latest-stable deps policy.

## Where we are
- `apps/web` **homepage committed** (`c49d1ae`). **News + Videos** (list + detail each) built after that — see `PROGRESS.md` 2026-06-11 Session 4. `next build` clean (all routes). **Uncommitted** — I review/commit (see PROGRESS manual actions).
- Backend feature-complete for V1; admin UI complete; public site = home + news + videos done. Remaining public page: **contact / lead form**.
- Spec: `docs/superpowers/specs/2026-06-11-web-home-design.md`. Stitch designs pulled (project "Legal Office Digital Suite" / theme "Lex Legacy"). No contact screen exists — derive from the system.

## Established conventions (follow them)
- Components **app-local** in `apps/web/src/components/{layout,ui,home,posts}` — no `packages/ui` yet.
- Theme = CSS vars in `apps/web/src/app/globals.css` (`@theme inline`, full Stitch token ramp, sharp radius 0). **Never hardcode brand hex.**
- Fonts: Noto Serif Armenian (display) + Noto Sans Armenian (body) via `lib/fonts.ts`.
- Data: server components + `lib/api/client.ts` (ISR `revalidate:300`, `ApiError`) → `lib/api/posts.ts`. Localized jsonb via `lib/i18n.ts` `localized(value, locale)`. Dates via `lib/format/date.ts`. Cover URL via `lib/image.ts` `coverUrl(slug)`. Video embed via `lib/video.ts` `videoEmbedUrl(url)`.
- Posts UI primitives already built: `components/posts/{post-card,video-card,pagination,post-content}`. List pages reuse the hairline card grid; detail pages share the `PostContent` renderer.
- **Post `content` is `{ <locale>: { text: string } }`** (plain, from the current admin textarea) — NOT Tiptap JSON yet. `PostContent` renders that shape; the Tiptap renderer is deferred until admin gets the Tiptap editor.
- All strings via next-intl `messages/hy.json`. Icons: inline SVG in `components/ui/icon.tsx` (add new paths there).

## This session's goal: Contact / lead form (last public page)
1. **Contact section/page** — a form (name, phone, email?, message?) posting to `POST /api/public/leads`. Client component; validate with the shared `createLeadSchema` from `@exlege/types`; success/error states; all strings in `hy.json`. Decide placement: a `#contact` section on the home page (the hero/footer CTAs already anchor there) vs a dedicated `/contact` route — recommend the home `#contact` section + reuse on a route if needed.
2. Add `lib/api/leads.ts` (`submitLead`) — needs a client-side POST via `apiPost` (extend `lib/api/client.ts`).
3. Wire the homepage/footer `#contact` anchors to the new section.

## API contracts (no auth; tenant via `DEFAULT_TENANT_SLUG`)
- `GET /api/public/posts?type=NEWS|CASE_WIN|VIDEO&page&pageSize` → `Paginated<PublicPostListItem>`.
- `GET /api/public/posts/:slug` → `PublicPostDetail` (adds `content`).
- `GET /api/public/posts/:slug/cover` → image bytes (published only).
- `POST /api/public/leads` → `{name, phone, email?, message?}` (contact form — **build this**).

## Open debt
1. Hero uses a CSS gradient, no photo — drop a real columns photo at `apps/web/public/` and wire it.
2. Tiptap JSON→HTML renderer + admin Tiptap editor (post `content` is plain `{text}` for now).
3. `@nestjs/throttler` on public endpoints before prod. Tests: unit for `lib/*` (date/image/i18n/video/client) + Playwright e2e.
4. Admin debt (unchanged): refresh token localStorage → httpOnly cookie; textarea → Tiptap.

## Env reminders
- My machine: local Postgres (pgAdmin), runs dev servers. Docker compose: Postgres :5433, Redis :6379. admin :3001, api :4000, web :3000. Web env in `apps/web/.env.local` (see PROGRESS).
- Your sandbox: no network to my localhost, but general internet works. **You CAN run pnpm/next/build** — the default shell pins Node v22.12, but v24.16 is installed (nvm default 24); prefix `PATH="/Users/vahe/.nvm/versions/node/v24.16.0/bin:$PATH"` → pnpm 11.5.3 + `next build`/`next start` all work. Use it to actually build + Playwright-screenshot pages, not just `tsc`. `dist/` of packages is gitignored; rebuild `@exlege/types` after editing its `src`.
- Seed admin: `admin@exlege.local` / `ChangeMe123!`
