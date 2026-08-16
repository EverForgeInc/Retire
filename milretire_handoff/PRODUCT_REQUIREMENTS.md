# Military Retirement App — Product Requirements Document

## 1. Product purpose

Build a secure, mobile-first retirement planning application for U.S. service members. The initial implementation is optimized for active-duty U.S. Air Force retirement but must use configurable rules so other services, components, installations, and policy changes can be added without rewriting the core application.

The application converts a projected retirement date into a personalized chronological checklist. Each task includes owner/category, calculated date range, status, completion date, notes, evidence references, dependencies, official-source metadata, and local installation overrides.

## 2. Initial user profile

- Name
- Rank
- Projected retirement date
- Branch
- Component
- Installation
- Personal email
- Time zone
- SkillBridge participation and dates
- Terminal leave start date
- Final duty day
- Retirement location
- Overseas/CONUS status

The application must not request, collect, display, transmit, or store any portion of a Social Security number.

## 3. Core outcomes

1. Generate a complete retirement timeline from a projected retirement date.
2. Recalculate all task windows when the retirement date changes.
3. Preserve completed task history when dates change.
4. Support status, optional completion date, notes, evidence references, and audit history for every task.
5. Distinguish official requirements, recommendations, and local requirements.
6. Support base-specific and service-specific overrides.
7. Provide reminders and overdue alerts.
8. Export a printable PDF retirement binder and machine-readable JSON/CSV.
9. Maintain an auditable history of changes.
10. Work well on iPad, iPhone, desktop, and modern browsers.

## 4. Primary roles

### Member
Views and completes a personal checklist, adds evidence references and notes, changes the retirement date, configures digest emails, and exports records.

### Spouse/family collaborator
Optional limited access to assigned tasks only.

### Administrator
Manages task templates, official sources, policy versions, service-specific rules, and local installation overrides.

### Counselor/transition staff
Optional read-only or assigned-task access with member consent.

## 5. Required screens

1. Sign in / account creation
2. Member onboarding
3. Retirement-date setup
4. Dashboard
5. Chronological timeline
6. Task detail
7. Evidence and document references
8. Calendar/reminders
9. Benefits center
10. VA claim tracker
11. Medical records tracker
12. TMO/relocation tracker
13. TAP/SkillBridge tracker
14. Settings and privacy
15. Export center
16. Admin template editor
17. Local installation configuration
18. Audit history

## 6. Dashboard requirements

Display:
- Days until retirement
- Current timeline phase
- Tasks due in 7, 30, and 90 days
- Overdue tasks
- Waiting tasks
- Completion percentage
- Missing required attachments
- Upcoming appointments
- VA BDD eligibility window
- SkillBridge, terminal leave, final duty day, and retirement-date milestones

## 7. Task record requirements

Each task must include:
- Unique task ID
- Title
- Full description
- Category
- Owner
- Relative date rule
- Calculated start and end date
- Due date
- Status
- Date completed
- Notes
- Required evidence
- Attachment list
- Dependencies
- Official source URL
- Source version
- Last verified date
- Required/recommended/local classification
- Local override
- Reminder schedule
- Audit log
- Visibility/permissions

## 8. Date calculation rules

The projected retirement date is the anchor date.

Rules must support:
- Fixed number of days before or after retirement
- Fixed number of months before or after retirement
- Date ranges
- Event dependencies
- Manually overridden dates
- SkillBridge-based calculations
- Terminal-leave-based calculations
- Final-duty-day calculations
- Local office deadlines

Recalculate automatically whenever the projected retirement date changes. Do not overwrite completion dates or historical audit records.

Default projected retirement date in the supplied sample data: **1 June 2027**.

## 9. Notification rules

Support:
- Push, transactional email, checklist digest email, and in-app notifications
- 90-, 60-, 30-, 14-, 7-, 3-, and 1-day reminders
- Overdue reminders
- Dependency-cleared notifications
- Document-expiration reminders
- Appointment reminders
- User-configurable quiet hours
- Daily or weekly checklist digest cadence
- User-selected delivery time and, for weekly digests, day of week
- Digest scope controls for active-phase due items, overdue items, waiting items, and upcoming items
- One-click deep links from each digest item to its task
- Unsubscribe/pause controls and delivery audit history
- Time-zone awareness

## 10. Evidence and medical-record privacy model

The MVP must use a privacy-preserving reference model rather than a medical-record upload vault.

Required behavior:
- Medical-record uploads are disabled by default and are not required for any workflow.
- Users track the record category, treatment facility, request date, receipt date, completeness, missing items, and secure storage location chosen by the user.
- The app may store a short user-written evidence summary and a reference such as “MHS GENESIS download saved in encrypted personal drive,” but must not require the medical file itself.
- Task evidence may be satisfied by a confirmation number, completion note, external storage reference, or attestation.
- General administrative attachments may be enabled separately, but medical, dental, behavioral-health, VA examination, and other sensitive health-document categories must be blocked unless a future separately reviewed feature flag and security assessment explicitly enables them.
- Do not collect CAC credentials, passwords, classified information, operationally sensitive information, full bank account data, or any portion of an SSN.
- Provide clear privacy guidance and an export/delete function for all stored metadata.

## 10A. VA condition and functional-impact tracker

For every claimed or potential condition, support:
- Condition and body system
- Diagnosis status
- Service event or onset
- Symptoms, frequency, severity, and flare-ups
- Treatment history and evidence references
- **Functional impact on daily life and work**, written in the member’s own words
- Structured impact categories: walking, standing, sitting, lifting, carrying, reaching, sleeping, concentration, driving, stairs, exercise, household activities, work duties, and other
- Quantified examples where known, such as “knee arthritis limits walking to approximately 0.5 miles before pain requires rest”
- Assistive devices, accommodations, missed work, and help required from others
- Personal-statement and buddy-statement status
- Claim, examination, evidence-request, decision, and rating status

The app must state that it organizes the user’s own observations and evidence; it does not diagnose conditions, coach exaggeration, or predict/guarantee a VA rating.

## 11. Security and privacy

Minimum requirements:
- MFA
- Role-based access control
- Least privilege
- Encryption at rest and in transit
- Secure secrets management
- Audit logging
- Session timeout
- Account deletion/export
- Data retention settings
- No SSN or partial-SSN collection
- No passwords stored in notes
- No classified or CUI content unless the eventual hosting environment is separately authorized
- Clear disclaimer that the app is not an official personnel system
- OWASP ASVS-aligned development
- Input validation; malware scanning for any separately enabled nonmedical attachment feature
- Rate limiting
- Backups and restore testing

## 12. Accessibility

Target WCAG 2.2 AA:
- Keyboard navigation
- Screen-reader labels
- High contrast
- Text resizing
- Large touch targets
- Clear error messages
- No color-only status indicators
- Accessible PDF export

## 13. Nonfunctional requirements

- Mobile-first responsive design
- Offline-friendly read access where practical
- Fast load times
- Support at least 10,000 users in initial architecture
- Modular rules engine
- API-first design
- Automated tests
- Structured logging
- Error monitoring
- Versioned database migrations
- Internationalization-ready

## 14. Suggested technology stack

The coding AI may choose an equivalent stack, but the default recommendation is:

- Frontend: Next.js + TypeScript
- UI: Tailwind CSS + accessible component library
- Backend: Next.js server routes or FastAPI
- Database: PostgreSQL
- ORM: Prisma or SQLAlchemy
- Authentication: Auth.js, Clerk, or approved identity provider
- File storage: S3-compatible encrypted object storage
- Notifications: email provider + push notifications
- Hosting: secure cloud platform
- Testing: Vitest/Jest, Playwright, API integration tests
- PDF export: server-side PDF generation
- Infrastructure: Docker and environment-based configuration

## 15. Acceptance criteria

The MVP is acceptable when:
1. A user can create a profile and enter a retirement date.
2. All checklist sections calculate correctly.
3. The user can change the retirement date and see dates recalculate.
4. The user can complete tasks by changing status, with an automatically recorded timestamp and optional completion date and notes.
5. Notes do not visually overlap other fields.
6. Users can associate evidence references with tasks without uploading medical records; prohibited sensitive categories are blocked.
7. Dashboard counts and progress are correct.
8. Search and filtering work.
9. PDF, JSON, and CSV exports work.
10. The app passes automated tests for date calculations and permissions.
11. The user can use the app on an iPad.
12. An administrator can modify templates without code changes.

## 16. Supplied source files

- `checklist_data.json`: canonical checklist content and sample dates
- `checklist_tasks.csv`: flat task export
- `database_schema.sql`: proposed relational schema
- `openapi.yaml`: API contract
- `ui_specification.md`: screen and interaction detail
- `business_rules.md`: date and workflow logic
- `security_privacy.md`: required controls
- `acceptance_tests.md`: test scenarios
- `MASTER_BUILD_PROMPT.md`: prompt for the programming AI
- Personalized fillable PDF reference


## 17. Transition Timeline and Leave Planner

Implement the complete feature set defined in `transition_timeline_module.json`.

Required capabilities:
- Day-by-day calendar classification
- Leave accrual and usage calculations
- Duty, leave, PTDY, TDY, SkillBridge, terminal leave, out-processing, and retirement event types
- Overlap and gap detection
- Policy-limit warning framework
- At least 10 saved scenarios
- Calendar, horizontal timeline, summary, and comparison views
- Export to PDF and CSV

## 18. Income and Location Comparison

Implement `income_location_module.json`.

Required capabilities:
- At least 10 locations in one comparison
- Up to 25 saved locations
- VA scenarios from 0% through 100%
- Dependent configurations and SMC extensibility
- Retirement pay and household-income inputs
- Detailed cost-of-living categories
- Monthly and annual remaining-cash calculations
- Weighted ranking
- Low, expected, and high scenarios
- Source/date/confidence metadata for every externally supplied value
- User overrides without destroying source values

## 19. Official Data Updates

Implement the architecture in `official_data_integration.md`.

The MVP must include:
- Versioned VA rate tables
- Versioned military pay tables
- Staging/import/review/publish workflow
- Manual CSV/JSON fallback
- Source URLs and effective dates
- No credential collection for VA.gov, myPay, CAC, or DS Logon
