# Checklist Email Digest Architecture

## User experience
Users may turn digests off or select daily/weekly delivery. They choose local delivery time, weekly day, sections to include, and look-ahead days. Digests focus on incomplete tasks in the current chronological retirement phase, with optional overdue, waiting, and upcoming items.

## Privacy
Email contains only neutral task title, phase, due window, status, and an authenticated deep link. Never include diagnoses, VA functional-impact text, medical notes, evidence summaries, confirmation numbers, attachment names, or document contents.

## Processing
1. Scheduler identifies preferences due in each user's IANA time zone.
2. A deterministic period key (`daily:YYYY-MM-DD` or `weekly:YYYY-Www`) provides idempotency.
3. Query applicable incomplete tasks for the active phase; add configured optional sections.
4. Skip empty digest unless `send_empty_digest` is true.
5. Render accessible HTML and plain text.
6. Send through a transactional email provider and record provider ID/status.
7. Retry transient errors with the same period key; do not duplicate.
8. Honor pause/unsubscribe/suppression immediately.

## Minimum email sections
- Progress summary
- Due in current phase
- Overdue (optional)
- Waiting (optional)
- Upcoming within look-ahead (optional)
- Manage email preferences / unsubscribe
