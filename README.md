# Military Retirement Planner

Secure, mobile-first retirement planning MVP for U.S. service members. Built from the v3 developer handoff package in `milretire_handoff/`.

**This application is not an official Department of Defense, Department of Veterans Affairs, or U.S. government system.**

## Authoritative sources

1. `milretire_handoff/DEVELOPMENT_BASELINE_v3.md`
2. `milretire_handoff/MASTER_BUILD_PROMPT.md`
3. `milretire_handoff/checklist_data.json` (93 tasks, 14 phases)
4. `docs/design/dashboard-mockup.png` (UI reference)

## Stack

- Next.js (App Router) + TypeScript
- Prisma + SQLite for local development
- PostgreSQL targeted for closed-beta production
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

Open `http://localhost:3000`.

### Local demo account only

The seed script can create a local development account using `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD`. The shared demo credentials are not pre-filled in the application and must not be used for a production or closed-beta deployment.

## Closed beta account flow

Closed beta users create individual accounts at `/register` using an invitation code configured through `BETA_ACCESS_CODE`. Registration establishes the member session and sends the new user to `/onboarding`; completion of onboarding creates the member profile and checklist.

Production requirements:

- `AUTH_SECRET` is a unique random value of at least 32 characters.
- `APP_URL` uses HTTPS.
- `BETA_ACCESS_CODE` is at least 8 characters and distributed only to invited testers.
- `DATABASE_URL` must point to the approved production database; SQLite is development-only for the beta.
- `ALLOW_MEDICAL_UPLOADS` remains `false` unless a separately reviewed secure storage workflow is implemented.
- `/api/health` must return `200` and `status: ready` before the deployment is considered beta-ready. The endpoint exposes readiness codes only and does not expose secrets or member data.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local app |
| `npm run build` | Production build |
| `npm start` | Start production Next.js server |
| `npm test` | Unit/integration tests |
| `npm run test:e2e` | Playwright (iPad viewport) |
| `npm run db:seed` | Import checklist + local demo member |

## Key MVP capabilities

- Onboarding without SSN / Last 4
- 93-task chronological checklist with date recalculation
- Audited completion (no initials)
- Dashboard matching the mockup layout
- Timeline & leave planner with annual calendar
- Income + retirement-location comparison
- Automatic location lookup
- Free U.S. city-level cost preview/adoption with provenance
- International country/category price-level comparisons with fallback behavior
- VA functional-impact tracker
- Privacy-preserving evidence references (no medical uploads by default)
- Daily/weekly digest preferences + local test queue
- JSON / CSV / printable checklist export
- Staged official-rate imports with approval

## Database status

SQLite remains the local development database. Closed beta production must not use the local SQLite database because it does not provide the persistence, backup, concurrency, or operational characteristics expected for multiple testers.

The next beta-readiness task is to complete the Prisma/PostgreSQL migration and managed-database deployment workflow. Do not change the datasource provider in production without generating and testing the corresponding migration path.

## Environment

Copy `.env.example` to `.env`. Never commit real secrets or beta access codes.

## Provider status and fallback mode

- Location lookup uses OpenStreetMap Nominatim through a server-side adapter and retains normalized source metadata.
- U.S. cost-of-living preview/adoption uses reusable web data with provenance and explicit member adoption. Aggregate totals remain reference-only where needed to prevent double counting.
- International locations use comparative price-level sources where available and fall back to the World Bank country benchmark. These indexes are not silently converted into monthly expenses.
- Email digests currently support preference management and a local test queue only. No transactional email vendor or delivery credential is configured.
- Do not add vendor API keys to the repository. Add provider credentials through deployment environment variables only after an integration is reviewed.

## Rules and privacy model

- Projected dates drive early planning; an official separation date is authoritative once available. Active DES/IDES workflows suppress standard BDD routing, and BDD is inclusive from 180 through 90 days remaining.
- Waiting tasks can record who or what the member is waiting on and a follow-up date. Follow-ups appear in dashboard/digest action queues without changing task status automatically.
- VA preparation data is member-owned and sensitive. Routes authenticate and scope records to the current member, audit events store metadata rather than narratives, and medical documents stay outside the MVP by default.

## Branch workflow

Work on the assigned feature branch only. Before moving between coherent phases, run the focused tests, commit a descriptive checkpoint, push the feature branch, and verify the commit. Never force-push or merge directly to `main`.
