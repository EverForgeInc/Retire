# Acceptance Tests

## Date calculations

1. Given retirement date 2027-06-01, 180 days before equals 2026-12-03.
2. Given retirement date 2027-06-01, 90 days before equals 2027-03-03.
3. Given retirement date 2027-06-01, 30 days after equals 2027-07-01.
4. Month-based windows use calendar-month arithmetic.
5. Changing the retirement date recalculates incomplete tasks.
6. Completed task completion dates and notes remain unchanged.
7. Manually overridden dates remain unchanged and are visibly marked.

## Task completion

1. A task can be marked complete without initials; the system records the acting user and completion timestamp in the audit log.
2. A user may optionally enter an earlier completion date.
3. Notes accept multiline content and do not overlap status/date controls on iPad or desktop.
4. A completed task can be reopened with an audit entry.
5. Not-applicable tasks are excluded from progress.

## Evidence and medical privacy

1. Medical, dental, behavioral-health, and VA health-document uploads are blocked by default.
2. A user can satisfy evidence tracking with an attestation, confirmation number, note, or external secure-storage reference.
3. Sensitive narrative fields are never included in notification email bodies.
4. Any separately enabled nonmedical upload enforces file type, size, malware scan, ownership, and deletion audit requirements.
5. The profile, API, database, exports, and logs contain no SSN or partial SSN fields.

## Permissions

1. Members can access only their own profile and tasks.
2. Family collaborators see only assigned items.
3. Admins can edit templates but cannot view member documents without explicit authorization.
4. Unauthorized API requests return 401/403.

## Export

1. PDF export includes member name, rank, projected retirement date, calculated ranges, status, completion dates, and notes.
2. PDF, JSON, and CSV exports contain no SSN or partial SSN.
3. JSON export validates against the expected schema.
4. CSV export contains all tasks.
5. Export works on iPad.

## Accessibility

1. All controls have labels.
2. Keyboard-only navigation works.
3. Screen-reader order is logical.
4. Status is not communicated by color alone.
5. Touch targets meet mobile accessibility expectations.

## VA functional impact

1. Each VA condition supports a free-text functional-impact narrative.
2. Structured limitations can record activity, threshold/distance/duration, frequency, severity, flare-up effect, and accommodation.
3. Example text is clearly labeled as an example and is never copied into the member record automatically.
4. The interface warns users to be accurate and use their own experience; it does not predict a rating.

## Checklist email digests

1. Users can select off, daily, or weekly cadence and a local delivery time.
2. Weekly cadence supports a selected weekday.
3. The digest includes incomplete tasks in the active chronological section and optional overdue/waiting/upcoming sections.
4. Empty digests are skipped unless the user opts into a nothing-due message.
5. One digest is sent per scheduled period despite retries or job duplication.
6. Deep links require authentication and cannot expose another member’s tasks.
7. Unsubscribe, pause, and frequency changes take effect before the next send.
8. Email content excludes diagnoses, functional-impact narratives, medical notes, and document content.
