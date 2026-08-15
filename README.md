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

## Environment

Copy `.env.example` to `.env`. Never commit real secrets.
