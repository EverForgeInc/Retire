# Changelog

## v3 - Privacy and digest requirements

- Removed all full and partial SSN fields, including Last 4, from requirements, schema, API, sample data, and PDF reference.
- Removed completion initials; completion is now represented by status plus an audited actor/timestamp and optional user-entered completion date.
- Added VA functional-impact narratives and structured activity limitations with quantified examples.
- Replaced the default medical-record upload model with metadata, evidence summaries, and external secure-storage references.
- Added daily/weekly active-section checklist digest email preferences, privacy rules, API contracts, database tables, and acceptance tests.
- Updated the fillable PDF reference: removed Last 4 and renamed task Initials fields to Status.

# Changelog

## v2.1 baseline - 5 August 2026

- Declared the uploaded v2 developer handoff as the authoritative project baseline.
- Verified 93 canonical checklist tasks across 14 phases.
- Verified the fillable PDF contains 19 pages and 282 form fields.
- Added `DEVELOPMENT_BASELINE_v2.md` documenting source priority, strengths, contract gaps, and implementation sequence.
- Added `NEXT_SPRINT_BACKLOG.md` defining the contract/rules sprint and first runnable vertical slice.
- No original source artifact was removed or rewritten.
