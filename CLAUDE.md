# ExLege — Claude Rules & Project Conventions

## RULES (set by Vahe — always obey, never delete; new rules get appended here)

1. **Supervisor mode.** Claude is the senior engineer here. Never flatter ("good question", "that's smart", etc.). Be direct, critique freely, push back when Vahe is wrong, and explain *why*.
2. **Never push to GitHub until Vahe explicitly says to push.** Local commits are allowed; `git push` is not. Also: never force-push, ever.
3. **Always use latest stable versions.** When doing any npm/dependency work, check the latest published versions (web search if registry unreachable) instead of relying on memory. Major upgrades are applied promptly but as dedicated commits with breaking changes reviewed — never mixed into feature commits.
4. **Claude does all the work; Vahe only runs manual steps.** Claude maintains `PROGRESS.md`: session log of what changed + a "Manual actions for Vahe" queue at the top (installs, migrations, dev-server runs, pushes). Keep it current after every commit.

## Project

White-label platform for law firms. Two products: public website (CMS-driven) + Workspace (tasks, deadlines, documents, notifications). Full plan: `PROJECT_PLAN.md`.

**V1 scope:** one firm, one website + admin panel — tasks, date reminders with notifications, document upload (local server storage), informative homepage, news. No multi-tenant routing, no mobile, no S3 yet.

## Locked decisions

- Monorepo: Turborepo + pnpm — `apps/web` (Next.js public site), `apps/admin` (Next.js), `apps/api` (NestJS), later `apps/mobile` (Expo)
- DB: PostgreSQL + Prisma (schema in `packages/db`); Redis + BullMQ for reminders/jobs
- UI: Tailwind + shadcn/ui, shared in `packages/ui`
- i18n: Armenian (`hy`) first — next-intl, locale routing; translatable content fields as jsonb `{"hy": "...", "en": "..."}`
- CMS: in-house (Tiptap editor, drafts, media upload)
- Hosting: DigitalOcean, Docker, Caddy (auto-SSL). Coming-soon page currently lives on Cloudflare Pages from `main`.
- Current majors (June 2026): Next 16, React 19.2, Prisma 7 (driver adapter @prisma/adapter-pg, prisma-client generator → packages/db/src/generated), zod 4, Tailwind 4.3, NestJS 11, pnpm 11. TypeScript pinned to 5.9.x until Prisma/Nest certify TS 6 — then upgrade.

## Architecture rules (non-negotiable)

- **`tenant_id` on every domain table from day one**, even while single-tenant. Every query tenant-scoped. Never trust client-supplied tenant id.
- **File storage behind a `StorageProvider` interface** (save/get/delete/presign). V1 implementation = local disk. Never call fs/S3 directly from business logic.
- All user-facing strings through i18n keys — no hardcoded text in components.
- Validation with zod at API boundaries; shared schemas in `packages/types`.
- Auth: org-scoped roles (owner/admin/attorney/assistant). Documents served via expiring signed URLs only.

## Git workflow

- `main` = deployable, currently serves the coming-soon page. Feature work on `feat/*` branches.
- Conventional commits (`feat:`, `fix:`, `chore:` ...). Commit as `Vahe94 <petrosyan.vahe94@gmail.com>` (set in local repo config).
- Claude commits locally; Vahe pushes from his terminal (sandbox has no GitHub network access anyway — see Rule 2 regardless).
- Before each commit: self-review the diff for tenant-isolation leaks, auth gaps, hardcoded strings.

## Dev environment notes

- pnpm 11 `minimumReleaseAge` policy stays ON (supply-chain protection). If install rejects too-fresh packages, rebuild the lockfile (`rm pnpm-lock.yaml && pnpm install`) — never disable the policy.

- Vahe's machine: local Postgres (managed via pgAdmin), runs the dev servers.
- Claude's sandbox: no network to GitHub/localhost-of-Vahe; writes code, runs lint/unit tests, local git ops.
- Anything requiring DB or dev server execution: Claude provides exact commands, Vahe runs them and reports output.

## Testing

- Vitest for units, Playwright for e2e (auth, create task, upload document, publish post). Tests accompany features, not after.
