# UI Specification

## Design direction

Professional, calm, military-adjacent without looking like an official DoD system. Mobile-first. Large touch targets for iPad. Use clear typography and restrained colors. Do not use rank insignia or official seals unless authorized.

## Onboarding

Fields:
- Name
- Rank
- Branch/component
- Installation
- Projected retirement date
- Time zone
- SkillBridge dates
- Terminal leave start
- Final duty day
- Retirement location

After saving, generate the timeline and show the first active phase.

## Dashboard

Cards:
- Days to retirement
- Current phase
- Completion percentage
- Due this week
- Due in 30 days
- Overdue
- Waiting
- Missing attachments

Milestone strip:
- BDD opens
- BDD closes
- SkillBridge begins
- Terminal leave begins
- Final duty day
- Retirement date
- TRICARE QLE deadline

## Timeline

Each section shows:
- Relative label
- Calculated date range
- Number complete / total
- Expand/collapse

Each task card shows:
- Title
- Category/owner
- calculated dates
- status chip
- date completed
- notes preview
- evidence-reference indicator
- official/local indicator

## Task detail

Editable fields:
- Status
- Completion date
- Notes
- Due-date override
- Evidence reference / confirmation
- Permitted nonmedical attachments (feature controlled)
- Reminder settings

Read-only fields:
- Official description
- Owner
- Evidence expected
- dependencies
- source and last-verified date

## Evidence and records

The default view is a metadata tracker, not a medical-document repository. Filters include:
- category
- treatment facility or office
- task
- request/receipt date
- complete/partial/missing
- external secure-storage reference

Medical-file upload controls must not appear unless a future security-reviewed feature flag is enabled.

## VA condition detail

Fields include symptoms, flare-ups, functional impact narrative, structured activity limitations, quantified examples, assistive devices/accommodations, evidence references, and claim/exam status. Prompt example: “Describe how this issue affects everyday life or work. Example: knee arthritis limits walking to about 0.5 miles before you must rest.”

## Email digest settings

Controls:
- Off / daily / weekly
- Delivery time and time zone
- Weekly delivery day
- Include active-section due tasks
- Include overdue tasks
- Include waiting tasks
- Upcoming look-ahead days
- Send an email when nothing is due
- Pause and unsubscribe
- Send test digest

## Export

Options:
- Printable PDF
- Fillable PDF
- JSON
- CSV
- Retirement binder ZIP

## Admin

Template editor must support:
- section ordering
- task text
- relative date rules
- source metadata
- branch/component scope
- local installation overrides
- required/recommended classification
- version publishing
