# ExLege — Progress Log

Maintained by Claude after every work session. Newest first.
**Vahe: check "Manual actions" first — that's your queue.**

## ⚠️ Manual actions for Vahe (pending)

1. `pnpm install` (new dep: @types/multer)
2. Restart `pnpm dev`
3. **Open http://localhost:3001 → login `admin@exlege.local` / `ChangeMe123!`**
4. Click through the admin: create a case, create a task (set due date + "60" in reminders field), upload a document, download it, create + publish a post, check it appears at `curl http://localhost:4000/api/public/posts`, submit a lead via curl below and see it in the Leads page:
   ```bash
   curl -s -X POST http://localhost:4000/api/public/leads -H "Content-Type: application/json" -d '{"name":"Test","phone":"+37499000000"}'
   ```
5. Report what's broken/ugly (screenshots welcome) — UI polish iterates on your feedback.

## Done

- ✅ Phase 0 complete: monorepo, DB, auth, tasks, reminders, notifications — verified on Vahe's machine (June 10).

---

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
