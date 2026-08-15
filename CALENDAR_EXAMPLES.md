# Annual Calendar - Visual Examples & Use Cases

## 📊 Example Scenarios

### Scenario 1: Typical Military Retirement (June 2025)

**Setup:**
- Service Member retiring June 15, 2025
- Current leave balance: 30 days
- SkillBridge: March 1 - May 31, 2025
- Terminal leave: June 1 - June 15, 2025

**Calendar View (2025):**

```
JANUARY 2025               FEBRUARY 2025              MARCH 2025
Sun Mon Tue Wed Thu Fri Sat Sun Mon Tue Wed Thu Fri Sat Sun Mon Tue Wed Thu Fri Sat
         1   2   3   4               1               1
 5   6   7   8   9  10  11  2   3   4   5   6   7   8  2   3   4   5   6   7   8
12  13  14  15  16  17  18  9  10  11  12  13  14  15  9  10  11  12  13  14  15
19  20  21  22  23  24  25 16  17  18  19  20  21  22 16  17  18  19  20  21  22
26  27  28  29  30  31    23  24  25  26  27  28    23  24  25  26  27  28  29
                                                      30  31

[Legend shown in UI]
● Duty (dark gray) - Regular workdays
● Weekend (light gray) - Saturdays & Sundays
● Holiday (amber) - Federal holidays
● SkillBridge (blue) - March 1 through May 31
● Terminal Leave (orange) - June 1 through June 15
★ Retirement (emerald with star) - June 15

Result:
- Jan 20: MLK Day (amber)
- Feb 17: Presidents Day (amber)
- Mar 1-31: SkillBridge (blue, replaces work/weekends)
- Jun 1-14: Terminal Leave (orange, includes weekend May 31-Jun 1)
- Jun 15: Retirement Day (emerald with ★)
```

### Scenario 2: Complex Leave Pattern with TDY

**Setup:**
- Retirement date: August 20, 2026
- Annual leave block: July 1-10 (emerald)
- TDY assignment: July 15-25 (indigo)
- PTDY (personal business): July 27-31 (teal)
- SkillBridge: June 1 - August 19 (blue)

**Expected Calendar Appearance:**

```
JULY 2026
Sun Mon Tue Wed Thu Fri Sat
         1   2   3   4
 5   6   7   8   9  10  11  ← July 1-10: Leave (emerald)
12  13  14  15  16  17  18  ← July 15-25: TDY (indigo)
19  20  21  22  23  24  25
26  27  28  29  30  31      ← July 27-31: PTDY (teal)

Breakdown:
- July 1-10: Ordinary Leave (emerald) - chargeable
- July 11-14: Back to Duty (gray)
- July 15-25: TDY (indigo) - not chargeable, temporary assignment
- July 26: Duty (gray)
- July 27-31: PTDY (teal) - not chargeable, personal use
- Aug 1-19: SkillBridge (blue) - transition employment
- Aug 20: Retirement (emerald with ★)
```

### Scenario 3: Medical Appointments & Final Processing

**Setup:**
- Retirement date: December 10, 2027
- Terminal leave: Nov 15 - Dec 10
- Medical/VA appointments: Nov 20, Nov 27, Dec 5 (all during terminal leave)
- Outprocessing window: Dec 1-9

**Calendar Rendering:**

```
NOVEMBER 2027
Sun Mon Tue Wed Thu Fri Sat
         1   2   3   4   5
 7   8   9  10  11  12  13
14  15  16  17  18  19  20  ← Nov 15-30: Terminal Leave (orange)
21  22  23  24  25  26  27
28  29  30

DECEMBER 2027
Sun Mon Tue Wed Thu Fri Sat
         1   2   3   4
 5   6   7   8   9  10  11  ← Dec 1-9: Outprocessing (violet)
12  13  14  15  16  17  18  ← Dec 10: Retirement (emerald ★)
                              ← Medical appts: 11/20, 11/27, 12/5
19  20  21  22  23  24  25     (shown in tooltip on hover)
26  27  28  29  30  31

Key Dates (hover for details):
- Nov 20: Terminal Leave + Medical appointment (orange, tooltip shows med appt)
- Nov 23: Thanksgiving (but terminal leave takes precedence → orange)
- Dec 1-9: Outprocessing window replaces terminal leave (violet)
- Dec 10: Retirement Day with star ★
```

## 🎨 Color Precedence Examples

### What Shows When Multiple Events Occur?

**Day with Holiday + Weekend:**
- Thanksgiving (always 4th Thursday in November)
- If it falls on weekend (hypothetically)
- **Display:** Holiday color (amber) wins over weekend
- **Tooltip:** Shows "Thanksgiving" with date details

**Day with Leave + Federal Holiday:**
- July 4th coincides with ordinary leave
- **Display:** Ordinary leave color (emerald) wins
- **Tooltip:** Shows leave info, not holiday (leave has higher priority)

**Day with SkillBridge + Federal Holiday:**
- July 4th during SkillBridge employment
- **Display:** SkillBridge color (blue) wins
- **Tooltip:** Shows SkillBridge, not holiday

**Day with Terminal Leave + Outprocessing:**
- Last week includes both terminal leave and outprocessing
- **Display:** Outprocessing color (violet) shows
- **Tooltip:** Indicates outprocessing takes precedence

**Day with Retirement Ceremony + Leave:**
- Ceremony scheduled during terminal leave block
- **Display:** Leave color (orange) with ceremony star (★)
- **Tooltip:** Shows both - ceremony as marker, leave as primary

## 📱 Responsive Views

### Desktop (1440px+)
```
Layout: 3 columns × 4 rows
[January] [February] [March]
[April]   [May]      [June]
[July]    [August]   [September]
[October] [November] [December]

Each month:
- Full 6-week grid
- Day numbers: 9px font
- Weekday headers: Clear
- Good spacing: 6px gaps
```

### Tablet (768px-1440px)
```
Layout: 2 columns × 6 rows
[January]  [February]
[March]    [April]
[May]      [June]
...

Adjusted:
- Slightly smaller fonts
- Tighter month spacing
- Still readable at arm's length
```

### Mobile (< 768px)
```
Layout: 1 column × 12 rows (vertical scroll)
[January]
[February]
[March]
...

Optimized:
- Full width month grids
- Day cells: 10px padding
- Readable on phone
- Touch-friendly tap targets
```

## 🎯 Use Case Workflows

### Use Case 1: Annual Leave Planning
**Soldier:** "I need to see where I can take my leave this year"

1. Navigate to `/annual-calendar`
2. Year automatically set to retirement year
3. Scan calendar for clusters of emerald (ordinary leave) blocks
4. Hover over existing leave to see dates
5. Compare with TDY (indigo) and PTDY (teal) to find gaps
6. Plan personal vacation around military commitments

### Use Case 2: SkillBridge Compliance
**Officer:** "I need to verify my SkillBridge dates fit the regulations"

1. Open annual calendar
2. Look for blue (SkillBridge) block
3. Verify:
   - Starts at least 180 days before retirement
   - Ends exactly on retirement date
   - No overlap with terminal leave
4. Hover over blue dates to confirm start/end dates
5. Export or screenshot for compliance documentation

### Use Case 3: Leave Balance Management
**NCO:** "Will I use all my leave before retirement?"

1. View calendar for emerald (leave) blocks
2. Count visual blocks or hover for duration tooltip
3. Cross-reference with Terminal Leave (orange)
4. Estimate total chargeable days from visual distribution
5. Compare against balance shown in Timeline KPI cards
6. Adjust leave planning if balance is at risk

### Use Case 4: Family Relocation Planning
**Family member:** "When should we move based on duty status?"

1. Show calendar to spouse
2. Point out:
   - Blue (SkillBridge) = flexible new job location
   - Orange (terminal leave) = can be anywhere, no duty
   - Gray/dark gray = must be at military location
3. Plan move during terminal leave window (orange)
4. Prepare house sale/new location during SkillBridge (blue)

### Use Case 5: Final Out Coordination
**Admin:** "When must we schedule all outprocessing?"

1. Review calendar for violet (outprocessing) block
2. Verify it's in final week before retirement
3. Check that medical appointments (cyan) fit in outprocessing window
4. Ensure finance, personnel, medical are aligned with dates shown
5. Send soldier reminder with calendar view attached

## 📊 Example Data Visualizations

### Heat Map Interpretation

**High Activity Period (Lots of Colors):**
```
June-August: Multiple event types
- Blue (SkillBridge): Primary activity
- Teal (PTDY): Personal time blocks
- Orange (Terminal Leave): End period
- Violet (Outprocessing): Final week
→ "Busiest transition period"
```

**Low Activity Period:**
```
January-May: Mostly gray/light gray
- Dark gray (Duty): Regular workdays
- Light gray (Weekends): Normal pattern
- Amber dots: Just holidays
→ "Routine duty phase"
```

### Timeline Interpretation

**Typical Military Retirement Arc:**
```
Months 1-12: Work (dark gray + weekends)
Months 13-15: SkillBridge (blue)
Final month: Terminal Leave (orange) → Retirement (✓)

Visual: Dark → Blue → Orange → Emerald ★
Story: Work → Train → Rest → Retire
```

## 🔄 Year-Over-Year Comparison

### Viewing Before Retirement Year

**Example: Retiring June 2025, viewing 2024**

```
2024 (One year before)
Sun Mon Tue Wed Thu Fri Sat
- Almost entirely duty (dark gray)
- Weekends follow normal pattern (light gray)
- Federal holidays (amber dots)
- One or two leave blocks (emerald)
- No SkillBridge, PTDY, or terminal leave

Interpretation: "Normal year, no retirement transition activities yet"
```

### Viewing After Retirement Year

**Example: Retiring June 2025, viewing 2026**

```
2026 (One year after)
Sun Mon Tue Wed Thu Fri Sat
- First 5 months: Mix of duty (gray) and weekends
- No blue (SkillBridge) - retired
- Possible emerald (vacation leave) if planned
- Possible cyan (VA appointments) for health
- No terminal leave or outprocessing

Interpretation: "Post-retirement life, adjusting to new schedule"
```

## 🎓 Learning the Calendar

### First-Time User Flow

1. **Land on page:** See 12 months at once
   - "Wow, I can see my whole year!"
   
2. **Read legend:** Understand color meanings
   - "Blue = SkillBridge, Orange = Terminal Leave"
   
3. **Hover over days:** See interactive tooltips
   - "Oh, that's November 11, Veterans Day"
   
4. **Navigate years:** Go back/forward
   - "This year is busy with SkillBridge, next year is calm"
   
5. **Compare with Timeline page:** See detailed lists
   - "Annual calendar shows the big picture, Timeline shows details"

### Expert User Flow

1. **Glance at colors:** Instantly read the year's pattern
2. **Spot conflicts:** Find overlapping events
3. **Verify compliance:** Check SkillBridge window
4. **Export/share:** Use for briefings or documentation
5. **Update scenario:** Return to Timeline page to edit

## 💡 Common Questions Answered

**Q: Why is my leave (emerald) showing on a weekend (light gray)?**
- A: Leave takes precedence and covers the full block, including weekends

**Q: Why doesn't my SkillBridge show different colors for weekdays/weekends?**
- A: SkillBridge is continuous employment; entire block shows same blue

**Q: Can I edit events from the calendar?**
- A: No, calendar is read-only. Go to Timeline page to edit events

**Q: What if I hover and see a date that doesn't match the color?**
- A: That's the highest-priority event for that day. Other events are hidden behind it

**Q: How do I print this calendar?**
- A: Use browser print (Ctrl+P) - responsive design includes print styles

**Q: Can I export to Outlook/Google Calendar?**
- A: Not yet - future enhancement being considered

---

**Ready to explore your retirement timeline!** 🎖️
