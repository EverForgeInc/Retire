# Business Rules

## Retirement date anchor

All relative checklist dates derive from `projected_retirement_date`.

### Default windows

- 18–24 months before: retirement date minus 24 months through minus 18 months
- 12–18 months before: minus 18 months through minus 12 months
- 9–12 months before: minus 12 months through minus 9 months
- 270–181 days before
- 180–121 days before
- 120–91 days before
- 90–61 days before
- 60–31 days before
- 30–15 days before
- Final 14 days: minus 14 days through minus 1 day
- Retirement date/first days: retirement date through plus 7 days
- Days 1–30 after
- Days 31–90 after
- Ongoing: plus 91 days onward

Use calendar-month arithmetic for month-based rules and day arithmetic for day-based rules.

## Date changes

When projected retirement date changes:
1. Recalculate every non-overridden task window.
2. Preserve completion date, status history, notes, evidence references, and permitted nonmedical attachments.
3. Flag completed tasks that now fall outside their new recommended window.
4. Record old and new values in the audit log.
5. Do not silently move manually overridden dates.

## Status behavior

Allowed values:
- not_started
- in_progress
- waiting
- complete
- not_applicable

A task may be marked complete without initials. The system must automatically record `completed_at` and the acting user in the audit log. A user-editable `date_completed` is optional for work completed earlier. Notes are optional unless the template marks them required.

## Evidence references and attachments

Evidence may be represented by an attestation, note, confirmation number, external secure-storage reference, or a permitted administrative attachment. Medical and health-record uploads are prohibited by default. No workflow may require an SSN or partial SSN, password, CAC credential, full financial account number, or medical-file upload.

## Local overrides

Local installation administrators may:
- Add tasks
- Hide nonapplicable tasks
- Change owner/category
- Add office contacts
- Add local due dates
- Attach local instructions
- Mark a task required locally

Core template text and local overrides must remain distinguishable.

## Official sources

Each policy-based task should support:
- URL
- document title
- issuing authority
- effective date
- last verified date
- superseded date
- version notes

## Progress calculation

Exclude tasks marked `not_applicable`.
Completion percentage = complete tasks / applicable tasks.
Show required and optional progress separately.

## Privacy

Do not request, store, display, export, or log any portion of an SSN. Medical records remain outside the app by default; store only user-entered metadata, summaries, and external secure-storage references.

## Checklist digest emails

- Digest cadence may be `off`, `daily`, or `weekly`.
- Daily digests run at the user-selected local time.
- Weekly digests run on the selected local weekday and time.
- “Active section” means the chronological phase containing the current local date. If no phase contains today, use the nearest upcoming phase.
- A digest includes incomplete applicable tasks whose calculated window intersects the active section, plus overdue tasks when enabled.
- Optional sections include waiting tasks and tasks due within a configurable look-ahead window.
- Do not include medical diagnoses, free-text VA functional-impact narratives, sensitive notes, or document contents in email. Use neutral task titles and deep links.
- Skip empty digests unless the user enables a “nothing due” confirmation.
- Record delivery status, provider message ID, and failure reason. Retry transient failures without duplicate sends.
- Every email must include pause, frequency-change, and unsubscribe controls.
