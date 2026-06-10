# ExLege — Progress Log

Maintained by Claude after every work session. Newest first.
**Vahe: check "Manual actions" first — that's your queue.**

## ⚠️ Manual actions for Vahe (pending)

1. `pnpm install` (new deps: @types/multer)
2. Restart `pnpm dev`
3. Smoke test (expect 201/200s):
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@exlege.local","password":"ChangeMe123!"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
   # case
   curl -s -X POST http://localhost:4000/api/cases -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title":"Test case","clientName":"Client A"}'
   # document upload (any small pdf/png on your machine)
   curl -s -X POST http://localhost:4000/api/documents -H "Authorization: Bearer $TOKEN" -F "file=@/path/to/some.pdf"
   # post + publish + public read
   curl -s -X POST http://localhost:4000/api/posts -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"type":"NEWS","slug":"first-news","title":{"hy":"Առաջին նորություն"}}'
   curl -s -X POST http://localhost:4000/api/posts/<id-from-above>/publish -H "Authorization: Bearer $TOKEN"
   curl -s http://localhost:4000/api/public/posts
   # public lead (no auth)
   curl -s -X POST http://localhost:4000/api/public/leads -H "Content-Type: application/json" -d '{"name":"Test","phone":"+37499000000"}'
   ```
4. Report results (or errors verbatim).

## Done (paste results into chat when convenient)

- ✅ Phase 0 complete: monorepo, DB, auth, tasks, reminders, notifications — all verified working on Vahe's machine (June 10).

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

### Known debt / next up
- Rate limiting on public endpoints (@nestjs/throttler) — before prod
- Email channel for reminders (Resend/SES) — Phase 1 polish
- ESLint flat config (Next 16 dropped `next lint`)
- Tests (vitest units for auth/reminders/storage; Playwright e2e) — next session
- Admin UI (login, tasks board, documents, posts editor) — next big block
- Web UI (homepage, news) — after admin
