# Next Sprint Backlog - Contract and Rules Foundation

## Sprint objective

Convert the handoff from a strong specification into implementation-ready contracts for a runnable MVP.

## P0 - Required

1. Expand `openapi.yaml` for transition scenarios, income/location comparisons, reminders, documents, audit, admin templates, installation overrides, and official-rate imports.
2. Expand `database_schema.sql` for roles/collaborators, template versions, installation overrides, document vault, exchange rates, notification delivery, and location-factor scoring.
3. Create a formal JSON Schema for `checklist_data.json` and validate all 93 tasks.
4. Define a deterministic date-rule engine interface and test fixtures for 1 June 2027.
5. Define event overlap precedence and leave-day counting rules.
6. Add seed/import validation with duplicate task-key detection and source-version logging.

## P1 - First runnable vertical slice

1. Profile onboarding and update.
2. Generate 93 member tasks from canonical templates.
3. Dashboard counts and current phase.
4. Chronological timeline.
5. Task status, audited completion timestamp, optional completion date, notes, evidence references, and audit events.
6. Retirement-date change with recalculation and preservation of completed history.
7. JSON and CSV export.

## P2 - Beta-specific modules

1. SkillBridge, PTDY, terminal leave, and final-out scenario planner.
2. Leave accrual and use-or-lose projections.
3. VA 0-100% scenario matrix with dependent configuration.
4. At least 10 simultaneous retirement-location comparisons.
5. Detailed Misawa expense model with editable local values and provenance.
6. Medical-record request tracker and VA evidence tracker.
7. Fillable/printable PDF retirement binder export.

## Definition of done

- Unit tests pass for date rules and income calculations.
- Integration tests pass for profile-to-task generation and retirement-date recalculation.
- E2E test passes on an iPad-sized viewport.
- No full SSN is accepted or stored.
- Completed task data survives date changes.
- All financial and cost-of-living outputs display source, date, confidence, and user-override state.
