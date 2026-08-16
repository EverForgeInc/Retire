# MASTER BUILD PROMPT FOR A PROGRAMMING AI

You are a senior full-stack engineer, product architect, database designer, security engineer, and QA lead.

Build a production-quality MVP called **Military Retirement Planner** using the files in this package as the authoritative specification.

## Required source files

Read all of these before writing code:
- PRODUCT_REQUIREMENTS.md
- checklist_data.json
- checklist_tasks.csv
- business_rules.md
- database_schema.sql
- openapi.yaml
- ui_specification.md
- security_privacy.md
- acceptance_tests.md
- transition_timeline_module.json
- income_location_module.json
- official_data_integration.md

The fillable PDF is a visual reference only. The JSON is the canonical checklist dataset.

## Default implementation

Use:
- Next.js with TypeScript
- PostgreSQL
- Prisma
- Tailwind CSS
- Accessible UI components
- Secure authentication
- S3-compatible encrypted file storage
- Playwright and Vitest
- Docker
- Environment variables
- Database migrations
- Seed script that imports checklist_data.json

Equivalent technologies are acceptable only when you explain the reason.

## Mandatory features

1. Member onboarding with name, rank, projected retirement date, installation, time zone, SkillBridge dates, terminal leave, and final duty day. Do not collect any SSN digits.
2. Automatic chronological task generation from retirement date.
3. Date recalculation when retirement date changes.
4. Task status, automatically audited completion, optional completion date, notes, and evidence references. Medical-file uploads are disabled by default.
5. Dashboard with due, overdue, waiting, and completion metrics.
6. Timeline grouped by phase with calculated date ranges.
7. Search and filtering.
8. Evidence/records metadata tracker with external secure-storage references; no default medical-file vault.
9. Reminders plus configurable daily/weekly checklist digest emails.
10. PDF, JSON, and CSV export.
11. Admin template editor.
12. Audit logging.
13. Mobile/iPad responsive interface.
14. Security/privacy controls listed in security_privacy.md.

## Coding requirements

- Produce complete runnable code, not pseudocode.
- Include README setup steps.
- Include `.env.example`.
- Include Docker configuration.
- Include migrations and seed data.
- Include API validation.
- Include error handling.
- Include automated unit, integration, and end-to-end tests.
- Do not hard-code the checklist into UI components; import it through the database seed.
- Do not request or store any portion of an SSN.
- Do not include real secrets.
- Do not claim the app is an official DoD system.
- Keep date rules in a reusable rules engine.
- Use calendar-month arithmetic for month offsets.
- Preserve completed task history when retirement date changes.
- Ensure notes never overlap status/date fields.
- Make PDF export render correctly on iPad.

## Build sequence

1. Summarize the architecture and identify assumptions.
2. Create the project file tree.
3. Implement database schema and migrations.
4. Implement seed import from checklist_data.json.
5. Implement authentication and member profile.
6. Implement date-rule engine with tests.
7. Implement checklist generation and task APIs.
8. Implement dashboard and timeline UI.
9. Implement task detail and notes.
10. Implement evidence references and optional permitted nonmedical attachments.
11. Implement VA functional-impact tracking.
12. Implement exports.
13. Implement reminders and daily/weekly checklist digests.
14. Implement admin template editor.
15. Implement audit logs.
16. Run tests and fix failures.
17. Provide final setup/deployment instructions.

Do not stop after scaffolding. Continue until the MVP is complete and runnable.


## Additional mandatory modules

### Transition Timeline and Leave Planner
Build all capabilities in `transition_timeline_module.json`, including event classification, leave accrual, overlap detection, scenario comparison, and calendar/timeline views.

### Income and Location Comparison
Build all capabilities in `income_location_module.json`, including 10+ location comparison, VA tiers, dependent configurations, detailed expenses, remaining cash, ranking, and scenario comparison.

### Official rate ingestion
Implement staged, versioned import services for VA compensation rates and military pay tables. Do not depend on brittle live scraping during normal user calculations. Calculations must use the latest administrator-approved effective version. Include manual CSV/JSON fallback and tests.
