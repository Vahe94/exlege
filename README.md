# Ex Lège

White-label platform for law firms: public website + Workspace (tasks, deadlines, documents). See `PROJECT_PLAN.md` for the full plan and `CLAUDE.md` for engineering rules.

## Structure

```
apps/
  web/      Public site — Next.js 15, next-intl (hy), Tailwind 4   :3000
  admin/    Admin panel — Next.js 15                               :3001
  api/      Backend — NestJS 11, Prisma                            :4000
packages/
  db/       Prisma schema + client (@exlege/db)
  types/    Shared zod schemas & types (@exlege/types)
  config/   Shared tsconfigs (@exlege/config)
```

## First-time setup

```bash
corepack enable                  # provides pnpm
pnpm install
cp .env.example .env
docker compose up -d             # Postgres :5433, Redis :6379
pnpm db:migrate                  # creates schema (prompts for migration name)
pnpm dev                         # all apps via turbo
```

pgAdmin connection: host `localhost`, port `5433`, user/db `exlege`, password `exlege_dev`.

## Daily commands

```bash
pnpm dev          # run everything
pnpm typecheck    # tsc across workspace
pnpm db:studio    # Prisma Studio
pnpm db:migrate   # after schema changes
```
