# 🛠️ Annual Calendar - Developer Guide

## Architecture Overview

```
App Router
└── /annual-calendar
    ├── Page (Server Component)
    │   ├── Fetches user context & scenario
    │   ├── Creates default scenario if needed
    │   └── Passes data to client component
    │
    └── AnnualCalendarControls (Client Component)
        ├── State: displayYear
        ├── Year navigation (prev/next buttons)
        ├── Context display
        └── Renders YearCalendar
            │
            ├── Legend Card
            ├── Tooltip Card (conditional)
            └── Grid of 12 MonthGrids
                └── Grid of 42 Day Cells (6 weeks × 7 days)
```

## File Organization

```
src/
├── app/
│   └── annual-calendar/
│       └── page.tsx                    [72 lines] Server component
├── components/
│   └── timeline/
│       ├── YearCalendar.tsx           [196 lines] Main calendar grid
│       ├── AnnualCalendarControls.tsx [76 lines] Year navigation wrapper
│       ├── TimelineCalendar.tsx       [EXISTING] Month view (for reference)
│       └── ...other components
└── lib/
    └── rules/
        ├── calendar.ts                [EXISTING] Color & legend definitions
        ├── date-engine.ts             [EXISTING] Phase calculations
        └── leave.ts                   [EXISTING] Event types & precedence

docs/
├── DELIVERY_SUMMARY.md                Feature completion summary
├── IMPLEMENTATION_SUMMARY.md          Technical deep-dive
├── ANNUAL_CALENDAR_FEATURE.md         User guide
├── CALENDAR_EXAMPLES.md               Visual examples & use cases
└── README.md                          [UPDATED] Project overview
```

## Component API

### YearCalendar

```typescript
interface YearCalendarProps {
  events: YearCalendarEvent[];
  year: number;
}

type YearCalendarEvent = TimelineEventInput & {
  id?: string;
};
```

**Props:**
- `events` - Array of timeline events (converted from Prisma)
- `year` - Year to display (e.g., 2025)

**Renders:**
- Legend card with all event types
- Tooltip card (when hovering)
- 12-month grid (3 columns, responsive)
- Summary legend at bottom

### AnnualCalendarControls

```typescript
interface AnnualCalendarControlsProps {
  events: YearCalendarEvent[];
  retirementYear: number;
  retirementDate: Date;
}
```

**Props:**
- `events` - Calendar events
- `retirementYear` - Year of retirement
- `retirementDate` - Full retirement date

**Features:**
- Manages `displayYear` state
- Previous/next buttons (disabled at bounds)
- Shows context (years until/after retirement)
- Passes events to YearCalendar

### Page Component

```typescript
// Server-side data fetching
async function AnnualCalendarPage()
```

**Responsibilities:**
1. Fetch user context via `getDashboardForPage()`
2. Query active TransitionScenario from Prisma
3. Create default scenario if none exists
4. Convert Prisma events to client format
5. Render AppShell with AnnualCalendarControls

## Event Precedence System

### DAY_PRECEDENCE Array

```typescript
export const DAY_PRECEDENCE: CalendarDayKind[] = [
  "duty",                    // 0 - lowest
  "weekend",                 // 1
  "federal_holiday",         // 2
  "ordinary_leave",          // 3
  "skillbridge",             // 4
  "ptdy",                    // 5
  "terminal_leave",          // 6
  "retirement_ceremony",     // 7
  "retirement",              // 8 - highest
];
```

**Resolution Logic:**
```typescript
function resolveDayKind(date, events, holidays) {
  let primary = isSaturday(date) ? "weekend" : "duty";
  
  // Check holidays
  if (holiday && precedence("federal_holiday") > precedence(primary))
    primary = "federal_holiday";
  
  // Check events in order
  for (const event of events) {
    if (isWithinInterval(date, event)) {
      kind = mapEventType(event.eventType);
      if (precedence(kind) > precedence(primary))
        primary = kind;
    }
  }
  
  return primary;
}
```

**Result:** Highest-priority event always displayed

## Styling System

### DAY_CELL_STYLES

```typescript
export const DAY_CELL_STYLES: Record<CalendarDayKind, { cell: string; text: string }> = {
  duty: { cell: "bg-slate-900", text: "text-white" },
  weekend: { cell: "bg-slate-200", text: "text-slate-700" },
  federal_holiday: { cell: "bg-amber-400", text: "text-slate-900" },
  ordinary_leave: { cell: "bg-emerald-500", text: "text-white" },
  skillbridge: { cell: "bg-blue-600", text: "text-white" },
  ptdy: { cell: "bg-teal-500", text: "text-white" },
  terminal_leave: { cell: "bg-orange-500", text: "text-white" },
  tdy: { cell: "bg-indigo-500", text: "text-white" },
  outprocessing: { cell: "bg-violet-600", text: "text-white" },
  medical_va: { cell: "bg-cyan-700", text: "text-white" },
  final_out: { cell: "bg-rose-600", text: "text-white" },
  retirement_ceremony: { cell: "bg-orange-500", text: "text-white" },
  retirement: { cell: "bg-emerald-600", text: "text-white" },
};
```

**Usage:**
```typescript
const styles = DAY_CELL_STYLES[dayResolution.primary];
<div className={cn(styles.cell, styles.text)}>
```

## Federal Holiday Generation

### federalHolidaysForYear(year: number)

Returns array of `{ date: Date; name: string }` for all holidays in a year.

**Fixed Holidays:**
```typescript
const US_FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 6, day: 19, name: "Juneteenth" },
  { month: 7, day: 4, name: "Independence Day" },
  { month: 11, day: 11, name: "Veterans Day" },
  { month: 12, day: 25, name: "Christmas Day" },
];
```

**Moveable Holidays (calculated):**
- MLK Jr. Day: 3rd Monday of January
- Presidents Day: 3rd Monday of February
- Memorial Day: Last Monday of May
- Labor Day: 1st Monday of September
- Columbus Day: 2nd Monday of October
- Thanksgiving: 4th Thursday of November

**Helper Functions:**
```typescript
// Nth weekday of month (e.g., 3rd Monday)
function nthWeekdayOfMonth(year, monthIndex, weekday, n): Date

// Last weekday of month (e.g., Last Monday)
function lastWeekdayOfMonth(year, monthIndex, weekday): Date
```

## Data Flow

### 1. Server-Side (Next.js)

```
Page Component loads
  ↓
getDashboardForPage() → Get user context
  ↓
prisma.transitionScenario.findFirst() → Load active scenario
  ↓
No scenario? → buildDefaultTransitionEvents() → Create default
  ↓
Convert to YearCalendarEvent[] format
  ↓
Render AppShell + AnnualCalendarControls
```

### 2. Client-Side (React)

```
AnnualCalendarControls mounts
  ↓
useState displayYear = retirementYear
  ↓
Render year nav + YearCalendar
  ↓
YearCalendar mounts
  ↓
Memoize: federalHolidaysForYear(displayYear)
  ↓
Memoize: eachMonthOfInterval(startOfYear, endOfYear)
  ↓
Render 12 MonthGrids
  ↓
Each MonthGrid renders 42 day cells
  ↓
User hovers cell → setHoveredTooltip
  ↓
Tooltip renders with full details
```

## Performance Optimizations

### 1. Memoization

```typescript
const holidays = useMemo(() => federalHolidaysForYear(year), [year]);
const months = useMemo(() => eachMonthOfInterval({...}), [year]);
```

Only recalculates when `year` changes.

### 2. Efficient Rendering

- Each MonthGrid is pure component (no extra renders)
- Day cells are simple divs (no expensive operations)
- Hover state only updates tooltip (not entire grid)
- No filter/map operations on every render

### 3. DOM Size

- 42 cells per month × 12 months = 504 DOM nodes
- Plus legend, tooltip, headers = ~550 total
- Very manageable (modern browsers handle thousands)

### 4. CSS Classes

- Use Tailwind utility classes (no CSS-in-JS)
- Browser caches generated CSS
- No dynamic style generation

## State Management

### AnnualCalendarControls

```typescript
const [displayYear, setDisplayYear] = useState(retirementYear);
```

- Single source of truth: `displayYear`
- Passed to YearCalendar to trigger recalculation
- Buttons update state
- Bounded: min year-2, max year+1

### YearCalendar

```typescript
const [hoveredTooltip, setHoveredTooltip] = useState<DayTooltip | null>(null);
```

- Tracks current tooltip
- Updated on mouse enter/leave
- Conditional render of tooltip card

## Event Type Mapping

### TimelineEventType → CalendarDayKind

```typescript
function mapEventType(eventType: string): CalendarDayKind | null {
  if (eventType === "retirement_ceremony") return "retirement_ceremony";
  if (DAY_PRECEDENCE.includes(eventType)) return eventType;
  return null;
}
```

**Mapping:**
- "ordinary_leave" → "ordinary_leave"
- "terminal_leave" → "terminal_leave"
- "skillbridge" → "skillbridge"
- "ptdy" → "ptdy"
- "tdy" → "tdy"
- "outprocessing" → "outprocessing"
- "medical_va" → "medical_va"
- "final_out" → "final_out"
- "retirement" → "retirement"
- "retirement_ceremony" → "retirement_ceremony"

## Accessibility Features

### ARIA Labels

```typescript
<Button aria-label="Previous year" ...>
<Button aria-label="Next year" ...>
```

### Semantic HTML

```typescript
<div role="grid"> {/* implied by context */}
  <div title={dayResolution.label || format(...)}>
    {/* Tooltip via title attribute */}
  </div>
</div>
```

### Color + Text

- Never rely on color alone
- Event type shown as badge text
- Date always visible as number

### Keyboard Navigation

- Buttons: Tab + Enter
- Day cells: Keyboard focus (blue outline)
- No ARIA-only controls

## Testing Strategy

### Unit Tests

**Existing tests (already passing):**
- `calendar.test.ts` - `resolveDayKind()`, `buildMonthGrid()`
- `date-engine.test.ts` - Phase calculations
- `leave.test.ts` - Leave logic
- `income.test.ts` - Income calculations

**New test opportunities:**
- `YearCalendar.test.tsx` - Render all 12 months
- `AnnualCalendarControls.test.tsx` - Year navigation
- `federalHolidaysForYear.test.ts` - Holiday generation

### Integration Tests

- Scenario loading and creation
- Event mapping to UI colors
- Hover tooltip interactions
- Year boundary navigation

### E2E Tests

- Load `/annual-calendar` page
- Verify all 12 months display
- Hover over retirement date
- Navigate between years
- Check colors match legend

## Extending the Feature

### Add a New Event Type

**Step 1:** Add to Prisma schema
```prisma
enum TimelineEventType {
  // existing...
  sabbatical  // NEW
}
```

**Step 2:** Add to precedence array
```typescript
export const DAY_PRECEDENCE: CalendarDayKind[] = [
  // ...
  "sabbatical",  // NEW
];
```

**Step 3:** Add styling
```typescript
export const DAY_CELL_STYLES = {
  // ...
  sabbatical: { cell: "bg-fuchsia-500", text: "text-white" },
};
```

**Step 4:** Add to legend
```typescript
export const CALENDAR_LEGEND = [
  // ...
  { kind: "sabbatical", label: "Sabbatical", swatchClass: "bg-fuchsia-500" },
];
```

**Step 5:** Test
```bash
npm test
npm run build
```

### Add Year-Range Navigation

**Currently:** Fixed range (year-2 to year+1)

**Enhancement:**
```typescript
const [yearRange, setYearRange] = useState({ min: retirementYear - 2, max: retirementYear + 1 });

<Select onChange={(year) => setDisplayYear(year)}>
  {/* Generate options from minYear to maxYear */}
</Select>
```

### Add Event Filtering

**Feature:** Toggle event types on/off

```typescript
const [visibleEvents, setVisibleEvents] = useState<Set<CalendarDayKind>>(new Set(DAY_PRECEDENCE));

const filteredEvents = events.filter(e => visibleEvents.has(e.eventType));
```

### Export to PDF

**Library:** `html2pdf` or `jspdf`

```typescript
<Button onClick={() => html2pdf().set({...}).save('calendar.pdf').from(calendarRef.current)}>
  Export PDF
</Button>
```

## Troubleshooting

### Days show wrong color?

1. Check `DAY_PRECEDENCE` order
2. Verify event `startDate` and `endDate` are inclusive
3. Check `resolveDayKind()` logic
4. Test with `npm test`

### Tooltip not appearing?

1. Verify `hoveredTooltip` state is updating (check React DevTools)
2. Check `onMouseEnter/Leave` handlers are wired
3. Verify `day.inMonth` is true (outside days don't trigger)

### Calendar shows wrong year?

1. Check `retirementYear` calculation
2. Verify `year` prop passed to YearCalendar
3. Confirm `displayYear` state in controls

### Build failing?

1. Run `npm run build` locally (detailed error messages)
2. Check TypeScript compilation: `npx tsc --noEmit`
3. Verify all imports are correct
4. Check for unused variables (ESLint)

## Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint warnings
- [ ] Documentation updated
- [ ] Reviewed by team lead
- [ ] Staging deployment successful
- [ ] User acceptance testing complete
- [ ] Production deployment

---

**Ready to extend and maintain!** 🚀
