# ExLege — Attorney Office Platform: Project Plan

**Date:** June 2026 · **Status:** Draft v2 — decisions locked: in-house CMS, Armenian-first i18n, AWS/DigitalOcean hosting

## 1. Vision

A white-label platform for law firms, sold as two separable products:

1. **Public Website** — marketing site with CMS-driven content (news, case wins, videos, practice areas, attorney bios), rebrandable per firm (logo, colors, content, domain).
2. **Workspace (Admin Panel + Mobile App)** — internal work organization: tasks, court/filing deadlines with notifications, document storage and sharing, team collaboration.

Both share one multi-tenant backend. A firm can buy either product or both; sold separately but integrated when combined.

## 2. Research Findings — What Good Attorney Sites Do (2026)

From reviewing current law-firm web design trends and conversion research:

- **Trust-first design**: attorney bios with real photos, bar admissions, awards, case results, testimonials. Testimonials on landing pages lift conversions up to ~34%.
- **Mobile-first**: ~67% of legal traffic is mobile; 53% of visitors abandon pages slower than 3s. Performance is a feature.
- **AI/SEO-optimized content**: heavy schema markup (Attorney, Organization, FAQ, Review) to win AI overviews and rich snippets — search is increasingly zero-click.
- **Strong CTAs**: personalized CTAs ("Get your free consultation on X") perform ~200% better than generic "Contact us". Intake forms with 3–5 fields max.
- **Visual trends**: bold typography, restrained palettes, real photography (not stock), card-based layouts, generous white space.
- **Accessibility (WCAG)**: keyboard nav, contrast, 16px+ body text — also a legal-liability issue for law firms themselves.
- **Practice-area pages**: dedicated page per practice area is the #1 SEO/conversion structure.

### Common weaknesses we'll exploit (our improvements)

- No online **consultation booking** (calendar with attorney availability) — most firms only have a contact form.
- No **structured intake forms** per practice area (qualify leads automatically).
- No **client portal** — secure download of case documents, status updates. Big differentiator.
- Poor **multilingual support** — i18n architecture from day one. **Launch: Armenian (hy)**; adding RU/EN later = translation files + translated content fields, no code changes.
- No **live chat / AI assistant** answering FAQ and capturing leads after hours.
- Stale content — our CMS makes publishing news/wins/videos trivial, with auto-generated OG images and schema.
- No measurement — built-in analytics dashboard (visits, leads, conversion per page).

## 3. Competitive Landscape (Workspace product)

Clio, MyCase, PracticePanther, Filevine dominate legal practice management. They're powerful but expensive, English/US-court-centric, and overkill for small firms. Our wedge: **lightweight, localized, affordable team organization** (deadlines, documents, notifications) bundled with the website — not full billing/trust-accounting (avoid that scope initially; it's a compliance swamp).

Key features competitors validate as must-haves: rules-based deadline workflows, task templates per case type, document templates, calendar sync, and deadline notifications (missed court deadlines = malpractice risk — this is our strongest selling point).

## 4. Product Scope

### 4.1 Public Website (per tenant)

- Home, Practice Areas, Attorneys (bio pages), News/Blog, Case Results, Videos, FAQ, Contact
- Consultation booking + intake forms (lead inbox in admin)
- i18n, dark/light optional, theme tokens (logo, palette, fonts) per tenant
- SEO: schema markup, sitemaps, OG images, per-page meta — all CMS-managed
- Optional: live chat widget, newsletter

### 4.2 Admin Panel (two scopes in one app, role-based)

**Site management** (if firm has website product):
- Content CRUD: posts, case wins, videos (upload or embed), attorneys, practice areas, FAQ
- Lead inbox from forms/booking, simple analytics dashboard
- Branding settings: logo, colors, domain, languages

**Work organization** (Workspace product):
- Cases/matters: client info, status, assigned team
- Tasks & deadlines: due dates, priorities, recurring, task templates per case type
- Notifications: in-app, email, push (mobile) — e.g., "Submit motion X in 3 days"
- Documents: upload, folder per case, versioning, share links, templates
- Team: roles (admin/attorney/assistant), activity log
- Calendar view + ICS/Google Calendar sync

### 4.3 Mobile App (Workspace companion)

- Auth, case list, my tasks, deadline push notifications, document view/download, quick notes
- React Native (Expo) — iOS + Android from one codebase
- V1 is read-heavy + task completion; full editing stays in admin panel

## 5. Architecture & Tech Stack

### Monorepo (Turborepo + pnpm)

```
exlege/
├── apps/
│   ├── web/        # Public multi-tenant website — Next.js
│   ├── admin/      # Admin panel — Next.js (SPA-ish)
│   ├── api/        # Backend — NestJS
│   └── mobile/     # React Native (Expo)
├── packages/
│   ├── ui/         # Shared design system (Tailwind + shadcn/ui)
│   ├── db/         # Prisma schema + client
│   ├── types/      # Shared TS types / zod schemas
│   └── config/     # eslint, tsconfig, tailwind presets
```

### Frontend — Public site
- **Next.js (App Router)**, SSR/ISR for SEO — non-negotiable for law-firm sites
- **Multi-tenancy via middleware**: resolve hostname → tenant → theme + content (Vercel Platforms pattern). One deployment serves all firms; wildcard subdomains (`firm.exlege.com`) + custom domains with auto-SSL
- **Theming**: design tokens (CSS variables) per tenant from DB — logo, palette, typography; 2–3 layout "templates" to vary look beyond colors
- Tailwind CSS + shadcn/ui, next-intl for i18n

### Admin panel
- Separate **Next.js** app (separate deployment → resellable separately)
- TanStack Query + zod forms; same shared UI package

### Backend
- **NestJS (Node + TS)** — structured, modular, you know the ecosystem. REST + OpenAPI (mobile + admin consume same API)
- **Auth**: better-auth or Auth.js, JWT + refresh; org-scoped roles (owner/admin/attorney/assistant)
- **Jobs/notifications**: BullMQ + Redis — deadline reminder scheduler, email (Resend/SES), push (Expo Push/FCM)
- **Files**: S3-compatible storage (AWS S3 or Cloudflare R2), presigned URLs, per-tenant prefix
- **Video**: embed YouTube/Vimeo for V1; Cloudflare Stream later if firms want private hosting

### Database
- **PostgreSQL** — single DB, shared schema, `tenant_id` on every row + **Postgres RLS** as a second enforcement layer (every query tenant-scoped at framework AND db level)
- **Prisma** ORM; **Redis** for cache/queues
- Why not DB-per-tenant: ops overhead at 10–50 tenants isn't worth it; RLS + middleware is industry standard. Revisit if a big client demands isolation (hybrid is possible later)

### CMS — DECIDED: in-house
Content management is built **into our admin panel** — CRUD screens on posts/case wins/videos/attorneys/FAQ. One product, one auth, full white-label control.
- Rich text: **Tiptap** editor (JSON content, renders in Next.js)
- Media: upload widget → S3-compatible storage, simple media library per tenant
- Drafts/publish status + `published_at`; versioning later if needed
- **Multilingual content**: translatable fields stored as `jsonb` (`{"hy": "...", "en": "..."}`); admin shows a language tab per field. Armenian-only at launch, more locales = data, not schema changes

### i18n — DECIDED: Armenian first
- UI strings: next-intl (web/admin), i18n-js (mobile) — `hy` locale at launch, keys ready for `ru`/`en`
- Content: jsonb translated fields (above); locale routing `/{locale}/...` with `hy` default
- Watch-outs: Armenian font support in chosen typefaces (check Noto Sans Armenian / Montserrat arm subset), date/number formatting via `Intl` with `hy-AM`

### Hosting — DECIDED: AWS or DigitalOcean (self-hosted, Dockerized)
- Everything in Docker → provider-portable. **Start with DigitalOcean** (simpler, cheaper): 1–2 droplets or DO App Platform, Managed Postgres, Managed Redis (or Redis container), DO Spaces (S3-compatible) for files
- AWS equivalent if/when needed: EC2/ECS, RDS, ElastiCache, S3, CloudFront
- **Caddy** as reverse proxy → automatic SSL for wildcard + customer custom domains (key for white-label)
- CI/CD: GitHub Actions → build images → deploy (Coolify or plain compose on droplet for V1)
- CDN/protection: Cloudflare in front (free tier) for caching + DDoS

## 6. Multi-Tenant / Resale Model

- **Tenant = law firm.** Provisioning flow in our internal "super-admin": create tenant → choose products (Website / Workspace / both) → set branding → invite users
- **Feature flags per tenant** (products and modules toggle on/off) → this IS the resale mechanism
- Billing later: Stripe subscriptions per tenant, per product, per seat (Workspace)
- Each new firm = config + content, **zero new code/infrastructure**. Target onboarding < 1 day

## 7. Build Order (Phases)

| Phase | Deliverable | ~Duration |
|---|---|---|
| **0** | Design system, brand templates, DB schema, monorepo scaffold, auth, tenant model | 2–3 wks |
| **1** | **Public website + content management**: all public pages, theming, i18n, SEO, leads/booking, admin content CRUD. *First sellable product* | 5–6 wks |
| **2** | **Workspace core**: cases, tasks, deadlines, notification engine (email + in-app), documents. *Second sellable product* | 5–6 wks |
| **3** | **Mobile app**: Expo app, push notifications, tasks/docs. Submit to stores | 4–5 wks |
| **4** | **Productization**: super-admin provisioning, custom domains automation, feature flags, billing, onboarding docs | 3–4 wks |
| **5** | Polish: analytics dashboard, calendar sync, doc templates, live chat/AI assistant | ongoing |

Phase 1 ships first deliberately: a live, good-looking firm site is the demo that sells everything else. First real client can be onboarded after Phase 1.

## 8. Security & Compliance (law firms = sensitive data)

- Tenant isolation enforced twice (app middleware + Postgres RLS); never trust client-supplied tenant id
- Documents: presigned, expiring URLs; encryption at rest (S3 SSE); audit log of access
- 2FA for admin users; session management; rate limiting
- GDPR-ready: data export/delete per tenant; privacy policy & cookie consent on sites
- Backups: automated Postgres + S3 versioning; per-tenant export (firms will ask "can we get our data out")

## 9. Open Questions (to discuss)

~~Decided: Armenian-first i18n · in-house CMS · AWS/DigitalOcean hosting (start DO, Dockerized, Caddy SSL)~~

1. **Workspace scope**: do we ever want billing/invoicing, or stay focused on organization? (Recommend: stay out of trust accounting.)
2. **Template variety**: how many distinct visual templates at launch — 1 polished or 3 lighter ones?
3. **Team**: just us two, or will designers/devs join? Affects phase durations.
4. **Client portal** (clients of the firm log in to see their case docs): Phase 5 or earlier? Strong differentiator.
5. **DO vs AWS**: confirm DO for V1? (Recommend yes — ~$50–80/mo all-in vs AWS complexity; migrate later if scale demands.)
6. **Armenian court-deadline templates**: which case types first for task/deadline templates (civil, administrative, criminal)?

## 10. Sources

- [Attorney at Work — 2026 law firm website trends](https://www.attorneyatwork.com/law-firm-website-design-trends-2026/)
- [PaperStreet — 2026 design trends](https://www.paperstreet.com/blog/2026-law-firm-website-design-trends/)
- [Walker Advertising — what converts in 2026](https://www.walkeradvertising.com/website-trends/)
- [LegalGPS — 10 must-have features](https://www.legalgps.com/solo-attorney/law-firm-website-must-haves)
- [CosmoLex — high-converting law firm websites](https://www.cosmolex.com/blog/high-converting-law-firm-website/)
- [Clio vs MyCase comparison](https://ustechautomations.com/resources/blog/clio-vs-mycase-legal-practice-management-comparison-2026)
- [Lawyerist — practice management software reviews](https://lawyerist.com/reviews/law-practice-management-software/)
- [Vercel — multi-tenant / Platforms Starter Kit](https://vercel.com/templates/next.js/platforms-starter-kit)
- [Developex — white-label SaaS architecture guide](https://developex.com/blog/building-scalable-white-label-saas/)
- [Rigby — multi-tenant architecture guide 2026](https://www.rigbyjs.com/resources/multi-tenant-architecture)
