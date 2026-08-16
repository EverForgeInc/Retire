# Annual Calendar Feature

## Overview

The new Annual Calendar provides a full-year view of your retirement transition timeline, displaying every day's status across 12 months. This complements the existing month-by-month timeline view.

## Location

**Route:** `/annual-calendar`

This page is now accessible alongside the existing Timeline page (`/timeline`).

## Key Features

### 1. **Full Year Grid View**
- All 12 months displayed in a 3-column layout (responsive)
- Each day shown as a colored cell with the date number
- Compact format allows full year visualization at once
- Months display Mon-Sun columns with padding for proper alignment

### 2. **Color-Coded Daily Events**
Each day is color-coded based on its highest-priority event:

| Color | Event Type | Meaning |
|-------|-----------|---------|
| Dark Gray | Duty | Regular workday |
| Light Gray | Weekend | Saturday or Sunday |
| Amber | Holiday | Federal holiday |
| Emerald | Leave | Ordinary chargeable leave |
| Orange | Terminal Leave | Final leave period before retirement |
| Blue | SkillBridge | Transition employment/career training |
| Teal | PTDY | Personal Temporary Duty |
| Indigo | TDY | Temporary Duty assignment |
| Cyan | Medical/VA | Medical or VA appointment |
| Rose | Final Out | Last duty day processing |
| Violet | Outprocessing | Separation processing |

### 3. **Priority Resolution**
When multiple events occur on the same day, the calendar displays the highest-priority event. Priority order (highest to lowest):
1. Retirement
2. Retirement Ceremony
3. Terminal Leave
4. PTDY
5. SkillBridge
6. Ordinary Leave
7. Federal Holiday
8. Weekend
9. Duty

### 4. **Interactive Tooltips**
- Hover over any day to see detailed information
- Tooltip displays:
  - Full date (day of week, month, date, year)
  - Event type badge
  - Holiday or event name
  - Star marker indicator (✓ for ceremony or retirement)

### 5. **Event Legend**
Two helpful guides are displayed:
- **Interactive Legend:** Shows all 9+ event types with color swatches
- **Color Guide:** Descriptive reference explaining each color's meaning

### 6. **Star Markers (★)**
Special markers appear on:
- **Retirement Ceremony Date:** Indicates ceremony event
- **Retirement Date:** Marks your official retirement date

### 7. **Federal Holiday Recognition**
Automatically includes all U.S. federal holidays:
- Fixed dates: New Year's Day, Juneteenth, Independence Day, Veterans Day, Christmas
- Moveable: MLK Jr. Day, Presidents Day, Memorial Day, Labor Day, Columbus Day, Thanksgiving

## Data Sources

The calendar pulls data from your active `TransitionScenario`, which includes:
- **Leave Events:** Ordinary leave, terminal leave
- **Training Programs:** SkillBridge periods
- **Temporary Duty:** TDY, PTDY assignments
- **Administrative Events:** Outprocessing, medical appointments, final out
- **Milestones:** Retirement date, retirement ceremony

## Technical Implementation

### Components
- **YearCalendar.tsx** - Main component displaying the full year
- **MonthGrid** - Individual month grid renderer
- **Uses existing:** `calendar.ts` rules, `federalHolidaysForYear()`, event resolution logic

### Data Flow
1. Page loads user's active `TransitionScenario` (creates default if none exists)
2. Converts database events to `YearCalendarEvent` format
3. Passes events and year to `YearCalendar` component
4. Component generates all 12 months using `resolveDayKind()` from calendar rules
5. Interactive hover state managed via React state

### Key Functions Used
- `federalHolidaysForYear(year)` - Generates all federal holidays for the year
- `resolveDayKind()` - Determines the primary event type for each day
- Event precedence matching based on `DAY_PRECEDENCE` array

## Viewing Other Years

The calendar currently displays the year containing your retirement date. To view other years:
1. Modify the year in the page component
2. Or create an enhanced version with year navigation controls

## Examples

### Example 1: Full Transition View
If you retire on June 15, 2025:
- Days 1-160: Shown as Duty (dark gray) with weekends in light gray
- Days 161-180: SkillBridge period (blue)
- Days 181-200: Terminal leave (orange)
- Day 166 (June 15): Marked as retirement with star ★
- All federal holidays highlighted in amber throughout the year

### Example 2: Complex Leave Planning
A calendar day with multiple overlapping events shows only the highest-priority event:
- If June 1 is both a terminal leave day AND federal holiday → displays terminal leave (orange)
- The priority ensures most important events are always visible

### Example 3: PTDY Usage
Personal Temporary Duty (teal) blocks appear for personal business:
- Used for job hunting, relocation, personal appointments
- Doesn't charge against leave balance
- Clearly distinguishable from chargeable leave

## Future Enhancements

Potential additions:
- [ ] Year navigation (back/forward buttons)
- [ ] Export calendar to PDF/iCal format
- [ ] Print-friendly view
- [ ] Multi-year comparison view
- [ ] Event filtering toggles
- [ ] Drag-and-drop event editing
- [ ] Integration with military calendar standards
- [ ] TDY location annotations
- [ ] Leave accrual balance overlay for each day

## Comparison to Timeline Page

| Feature | Timeline Page | Annual Calendar |
|---------|--------------|-----------------|
| Time Range | Current month (navigable) | Full year (fixed) |
| View Style | Month detail view | Year overview grid |
| Event Details | Full event list below | Hover tooltips |
| KPI Cards | Yes (leave balance, overlaps) | No (legend-focused) |
| Use Case | Detailed planning | Quick visual overview |
| Update Events | Yes, integrated form | No (read-only, reference) |

Both pages complement each other for comprehensive transition planning.
