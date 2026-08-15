# Military Retirement Planner - Development Baseline v2

## Baseline decision

This package is the authoritative current version of the Military Retirement Planner project as of 5 August 2026. Future work should build from this package rather than older spreadsheets, checklists, or chat-specific drafts.

## Verified package inventory

- 93 canonical checklist tasks across 14 chronological phases
- Default retirement date: 1 June 2027
- Fillable PDF reference: 19 pages, 282 fields
- Transition timeline and leave planner specification
- Retirement income, VA scenario, and location-comparison specification
- Cost-of-living source workbooks with more than 10 locations
- PostgreSQL schema draft
- OpenAPI draft
- Security and privacy requirements
- Acceptance tests
- Official-rate ingestion architecture

## Canonical source priority

1. `checklist_data.json` - canonical checklist content and date rules
2. `PRODUCT_REQUIREMENTS.md` - product behavior and scope
3. `business_rules.md` - calculation and workflow rules
4. `transition_timeline_module.json` - leave, SkillBridge, PTDY, TDY, final-out, and retirement scenarios
5. `income_location_module.json` - retirement income and location comparison
6. `official_data_integration.md` - official rates and provenance architecture
7. `database_schema.sql` and `openapi.yaml` - implementation contracts, to be expanded where gaps are identified
8. PDF, DOCX, CSV, and XLSX files - references, exports, and source validation

## Confirmed strengths

- Checklist content is sufficiently structured to seed a database.
- Retirement-date recalculation rules are defined.
- Completed-task history preservation is explicitly required.
- The data model already separates templates from member task instances.
- Financial estimates are described as scenarios rather than entitlements.
- Cost-of-living records include provenance and confidence concepts.
- Security requirements prohibit full SSNs and credential collection.
- The app is designed as a planning tool, not an official DoD system.

## Implementation gaps that must be closed

### API contract

The current OpenAPI file covers profiles, tasks, attachments, dashboard, and limited exports. It does not yet define endpoints for:

- Transition scenarios and timeline events
- Leave calculations and overlap checks
- Income scenarios and VA tiers
- Location searches, saved comparisons, weights, and custom expenses
- Official-rate staging, approval, and publication
- Exchange-rate history
- Reminders and notification preferences
- General document-vault operations
- CSV and retirement-binder ZIP exports
- Collaborator permissions
- Admin template/version management
- Installation overrides and local contacts
- Audit-history retrieval
- Account export and deletion

### Database contract

The current schema needs additional production tables or fields for:

- Roles, memberships, and family/counselor collaborators
- Template publication history and source versions
- Installation-specific overrides and office contacts
- General documents not tied to a single task
- Attachment versioning, scan state, deletion state, and retention policy
- Notification preferences and delivery attempts
- Exchange-rate versions
- Location-factor scores and user weighting
- Expense-value user overrides and provenance
- Timeline calculation snapshots and conflict results
- Saved comparison results
- Account deletion/export requests
- Refresh-token/session or identity-provider references as appropriate

### Rules and validation

- Define inclusive/exclusive counting rules for leave event start/end dates.
- Define precedence when event types overlap.
- Separate calendar days from chargeable leave days and duty days.
- Define timezone behavior for date-only retirement milestones and timed reminders.
- Define BDD window behavior when the member cannot complete exams before separation.
- Define policy-version effective-date selection for historical scenarios.
- Define how local overrides merge with core template updates.

## Recommended implementation sequence

1. Expand the relational schema and OpenAPI contract.
2. Build and test the reusable date/rules engine.
3. Seed the canonical checklist and generate member task instances.
4. Implement profile, dashboard, timeline, and task completion.
5. Implement transition scenario calculations.
6. Implement income and location comparisons.
7. Implement documents, reminders, audit history, and exports.
8. Implement official-rate staging and admin approval.
9. Add local installation overrides.
10. Complete accessibility, security, and end-to-end tests.

## Beta profile

The initial beta profile remains:

- Member: CMSgt David J. Najera
- Branch/component: U.S. Air Force active duty
- Installation: Misawa Air Base, Japan
- Projected retirement date: 1 June 2027
- The member's real transition, leave, SkillBridge, medical-record, VA, financial, and location-planning cases should be used as acceptance scenarios without exposing sensitive data in public seed data.
