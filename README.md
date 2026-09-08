# Military Retirement Planner

Secure, mobile-first retirement planning MVP for U.S. service members. Built from the v3 developer handoff package in `milretire_handoff/`.

**This application is not an official Department of Defense or U.S. government system.**

## Authoritative sources

1. `milretire_handoff/DEVELOPMENT_BASELINE_v3.md`
2. `milretire_handoff/MASTER_BUILD_PROMPT.md`
3. `milretire_handoff/checklist_data.json` (93 tasks, 14 phases)
4. `docs/design/dashboard-mockup.png` (UI reference)

## Stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite for local development (PostgreSQL via `docker-compose.yml` when Docker is available)
- Tailwind CSS
- Vitest + Playwright
- Session auth with signed HTTP-only cookies

## Quick start

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Demo login (from seed):

- Email: `david@example.com`
- Password: `changeme123`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local app |
| `npm run build` | Production build |
| `npm test` | Unit/integration tests |
| `npm run test:e2e` | Playwright (iPad viewport) |
| `npm run db:seed` | Import checklist + demo member |

## Key MVP capabilities

- Onboarding without SSN / Last 4
- 93-task chronological checklist with date recalculation
- Audited completion (no initials)
- Dashboard matching the mockup layout
- **Timeline & leave planner with annual calendar**
  - Month-by-month transition timeline with leave balance tracking
  - Full-year calendar view showing all daily events (work, leave, SkillBridge, TDY, PTDY, holidays)
  - Event precedence system with interactive tooltips
  - 11 federal holidays automatically calculated
- Income + 10-location comparison
- VA functional-impact tracker
- Privacy-preserving evidence references (no medical uploads)
- Daily/weekly digest preferences + local test queue
- JSON / CSV / printable checklist export
- Staged official-rate imports with approval

## Codespaces / devcontainer

This repository includes a lightweight devcontainer aimed at fast startup and predictable Codespaces behavior:

- Node 22 slim base image
- non-root `node` user
- dependency cache via `npm ci` and lockfile reuse
- Prisma generation in the image build
- forwarded port for the app at `:3000`
- primary app port labeled as "Retire App"
- common commands displayed at shell startup

To rebuild the devcontainer after dependency or Dockerfile changes:

```bash
# from the repo root
docker build -f .devcontainer/Dockerfile -t retire-dev .
```

## PostgreSQL (optional)

If Docker is installed:

```bash
docker compose up -d
```

Then set in `.env`:

```env
DATABASE_URL="postgresql://milretire:milretire@localhost:5432/milretire?schema=public"
```

Update `prisma/schema.prisma` datasource provider to `postgresql` before migrating.

## Security and CI

- GitHub Actions runs lint, type-check, unit tests, and production build on push/PR.
- Secret scanning uses `gitleaks` in CI.
- Dependency auditing runs with `npm audit --audit-level=moderate`.
- Keep API keys and credentials in `.env` only, never in committed files.

## Environment

Copy `.env.example` to `.env`. Never commit real secrets.

## Provider status and fallback mode

- Geocoding and cost-of-living providers currently use interface-only adapters. The default adapters return no provider data, so manual locations remain available and unknown coordinates/costs remain unavailable rather than becoming zero.
- The Income Planner accepts member-entered manual costs and preserves approved source values when they exist. Provider source, retrieval, and effective-date metadata should be retained for future integrations.
- Email digests currently support preference management and a local test queue only. No transactional email vendor or delivery credential is configured.
- Do not add vendor API keys to the repository. Add a provider adapter and documented environment variable only after the integration is implemented and approved.

## Rules and privacy model

- Projected dates drive early planning; an official separation date is authoritative once available. Active DES/IDES workflows suppress standard BDD routing, and BDD is inclusive from 180 through 90 days remaining.
- Waiting tasks can record who or what the member is waiting on and a follow-up date. Follow-ups appear in dashboard/digest action queues without changing task status automatically.
- VA preparation data is member-owned and sensitive. Routes authenticate and scope records to the current member, audit events store metadata rather than narratives, and medical documents stay outside the MVP by default.

## Branch workflow

Work on the assigned feature branch only. Before moving between coherent phases, run the focused tests, commit a descriptive checkpoint, push the feature branch, and verify the commit in `git log`. Never force-push or merge directly to `main`.
