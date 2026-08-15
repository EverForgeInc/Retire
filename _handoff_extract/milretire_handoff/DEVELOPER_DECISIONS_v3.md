# Developer Decisions v3

## Approved user-level changes

### Identity
- Remove Last 4 from onboarding, storage, APIs, exports, PDF forms, logs, and tests.
- The product does not need any SSN data.

### Checklist completion
- Remove initials from task completion.
- Status is the primary completion control.
- The system records the authenticated actor and timestamp automatically.
- An optional completion date supports work completed earlier.

### VA functional impact
- Add a member-authored narrative describing how each condition affects daily life and work.
- Add structured limitations with activity, threshold/distance/duration, frequency, severity, flare-up effect, and accommodation/device.
- Example: knee arthritis limits walking to approximately 0.5 miles before rest is required.
- Do not prefill example language, coach exaggeration, diagnose, or predict a rating.

### Medical-record privacy
- Do not upload or store medical records in the MVP.
- Track request status, facility, dates, completeness, missing items, evidence summary, and the user's external secure-storage label.
- Allow permitted administrative attachments only through a separate feature-controlled path.
- A medical-upload feature requires a future security and hosting review.

### Checklist digest email
- User-selectable off, daily, or weekly cadence.
- User-selected local time and weekly day.
- Default scope: incomplete tasks due in the active chronological section plus overdue tasks.
- Optional waiting and upcoming sections.
- Email contains neutral checklist information only, never medical/VA narratives or document contents.
- Include authenticated deep links, pause, preference, and unsubscribe controls.
