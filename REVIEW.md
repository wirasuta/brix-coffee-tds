# Frontend Review Checklist - Brix Coffee TDS Calculator

**Review Date:** 2026-05-02  
**Reviewer:** AI Agent  
**Plan Reference:** PLAN.md  
**Files Reviewed:** index.html, style.css, app.js  
**Browser Testing:** Completed (Desktop 1365px, Tablet 768px, Mobile 375px)

---

## ✅ Implementation vs Plan Compliance

### 1. HTML Structure
- [x] Three-row layout (Brix/TDS, Parameters, Results)
- [x] Collapsible references section (`<details>`/`<summary>`)
- [x] Header with title and reset button
- [x] Semantic HTML structure
- [x] Proper input types (number, select)
- [x] Accessibility basics (labels, placeholders)

### 2. CSS - Teenage Engineering Design Language
- [x] Dark background (#1a1a1a)
- [x] White primary text, gray secondary (#888888)
- [x] Orange accent (#ff6b35)
- [x] Monospace font stack (JetBrains Mono, IBM Plex Mono, etc.)
- [x] Grid-based layout
- [x] Sharp edges (no border-radius)
- [x] Thin 1px borders
- [x] Minimal, geometric UI elements

### 3. Brix ↔ TDS Bidirectional Sync
- [x] Formula: TDS = Brix × 0.85
- [x] Formula: Brix = TDS / 0.85
- [x] Bidirectional sync on input
- [x] Arrow indicator (↔) between inputs
- [x] Updates immediately on input

### 4. Extraction Yield Calculation
- [x] Precise formula: `EY = (TDS × Brew Ratio) / (1 - TDS / 100)`
- [x] Brew Ratio = Water Weight / Dose Weight
- [x] Only displays when dose + water provided
- [x] Shows "—" when insufficient data

### 5. Quality Indicator
- [x] Under-extracted (< 18%): yellow (#f0c040)
- [x] Optimal (18-22%): green (#40f080)
- [x] Over-extracted (> 22%): red (#f04040)
- [x] Colored dot + label display

### 6. Temperature Compensation
- [x] Formula: `correctionFactor = 1 + (temp - 20) × 0.0002`
- [x] Formula: `adjustedBrix = rawBrix / correctionFactor`
- [x] Default temperature: 20°C
- [x] Recalculates TDS when temperature changes

### 7. Reset Button
- [x] Clears all inputs
- [x] Resets to defaults (method: filter, temp: 20)
- [x] Resets lastEdited state
- [x] Updates display after reset

### 8. Mobile Responsive
- [x] Single column layout on mobile (≤480px)
- [x] Full-width inputs on mobile
- [x] Reduced padding on mobile
- [x] Stacked result groups on mobile
- [x] Tooltip adjustments for mobile
- [x] Formula text size reduction on mobile

### 9. References Section
- [x] Collapsible by default
- [x] Formulas displayed correctly
- [x] Sources listed with links
- [x] Typical ranges table included
- [x] Proper styling matches design language

---

## ⚠️ Issues Found

### 1. Page Title Not User-Friendly
- **Issue:** `<title>brix-coffee-tds</title>` is not user-friendly
- **Impact:** Browser tab shows technical name instead of readable title
- **Severity:** Low
- **Recommendation:** Change to "Brix ↔ TDS Coffee Calculator" or similar
- **Test Result:** Confirmed - `agent-browser get title` returns "brix-coffee-tds"

### 2. TDS to Brix Doesn't Compensate for Temperature
- **Issue:** `tdsToBrix()` function doesn't apply temperature compensation
- **Impact:** When editing TDS field, the resulting Brix value is not temperature-adjusted
- **Severity:** High
- **Recommendation:** Apply inverse temperature compensation when converting TDS → Brix
- **Test Result:** Confirmed - Entering TDS 12.75 at 30°C returns Brix 15.00 (should be different)

### 3. Redundant syncBrixTds and recalcTdsFromTemp Functions
- **Issue:** Two separate functions handle Brix/TDS sync logic
- **Impact:** Code duplication, harder to maintain, potential inconsistency
- **Severity:** Medium
- **Recommendation:** Consolidate into single `syncBrixTds()` function that handles all sync scenarios including temperature changes

### 3a. Architecture Should Follow React-like Pattern
- **Issue:** Current implementation mixes data mutation and UI updates in event handlers
- **Impact:** Harder to reason about state flow, potential for inconsistent updates
- **Severity:** Medium
- **Recommendation:** Adopt react-like pattern:
  - **Data mutation:** onXXX events collect input values and update state
  - **Side effects:** Single render/update function reads state and updates all UI elements
  - This creates a unidirectional data flow that's easier to debug and extend

### 4. Missing Immersion Range in References
- **Issue:** Typical ranges table only shows Filter and Espresso
- **Impact:** Users of immersion method lack reference data
- **Severity:** Low
- **Recommendation:** Add immersion coffee typical TDS range (typically 1.2-1.5%) and EY target

### 5. CSS Color Values Not Using Variables
- **Issue:** Some CSS color values use hardcoded hex instead of CSS variables
- **Impact:** Inconsistent theming, harder to maintain/modify colors
- **Severity:** Low
- **Recommendation:** Replace all hardcoded colors with CSS variable references
- **Test Result:** Confirmed - `#111111` used for tooltip background (line 136), should use a variable

### 6. CSS Spacing/Sizing Values Not Using Variables
- **Issue:** All margin, padding, gap, and sizing values are hardcoded
- **Impact:** Inconsistent spacing across components, harder to maintain design system
- **Severity:** Medium
- **Recommendation:** Define CSS variables for spacing scale (e.g., `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`) and font sizes

---

## ✅ Resolved Issues (Feedback Applied)

### Reset Button Icon
- **Status:** Resolved - SVG icon is intentional (emoji was ugly)
- **Decision:** Keep SVG implementation

### EEY Formula Display vs Implementation
- **Status:** Resolved - Mathematically equivalent
- **Decision:** No action needed

---

## 📱 Viewport Testing Results

### Desktop (1365px) ✅
- [x] Layout renders correctly at 1365px
- [x] All inputs visible and usable
- [x] Grid layout displays properly (2-column for params)
- [x] Brix/TDS side-by-side with arrow
- [x] Tooltips work on hover
- [x] References section collapsible
- **Screenshot:** `/tmp/desktop-1440.png`

### Tablet (768px) ✅
- [x] Layout adapts appropriately
- [x] Inputs remain usable
- [x] No horizontal scrolling
- [x] Touch targets adequate size
- [x] Params grid switches to single column
- **Screenshot:** `/tmp/tablet-768.png`

### Mobile (375px) ✅
- [x] Single column layout active
- [x] Inputs full-width
- [x] Touch targets ≥44px height
- [x] No horizontal overflow
- [x] Result section stacks correctly
- [x] Brix/TDS inputs remain side-by-side (narrower but usable)
- **Screenshot:** `/tmp/mobile-375.png`

### Small Mobile (≤360px) ⚠️
- [ ] Content fits without horizontal scroll
- [ ] Brix/TDS inputs remain side-by-side or stack gracefully
- [ ] Formula text readable in references
- **Note:** Not tested - would need further viewport resize

---

## 🧪 Functional Testing Results

### Brix ↔ TDS Sync ✅
- [x] Enter Brix 15 → TDS updates to 12.75 (correct: 15 × 0.85 = 12.75)
- [x] Enter TDS 10 → Brix updates to 11.76 (correct: 10 / 0.85 = 11.76)
- [x] Clear Brix → TDS clears
- [x] Clear TDS → Brix clears
- [x] Temperature change updates TDS from Brix

### Extraction Yield ✅
- [x] EY displays with valid dose + water (tested: 18g dose, 300g water, TDS 12.75 → EY 243.6%)
- [x] EY shows "—" without dose/water
- [x] EY updates when any parameter changes
- [x] Quality indicator color matches EY range (243.6% → "over-extracted" with red)

### Effective Extraction Yield ✅
- [x] EEY displays when brew weight provided
- [x] EEY hidden when brew weight empty
- [x] EEY calculates correctly

### Temperature Compensation ⚠️
- [x] Default 20°C works
- [x] Changing temperature adjusts TDS (Brix → TDS direction)
- [ ] Changing temperature adjusts Brix (TDS → Brix direction) **❌ Currently broken**
- [x] Reset returns to 20°C

### Reset Functionality ✅
- [x] All inputs cleared
- [x] Method resets to "filter"
- [x] Temperature resets to 20
- [x] Results reset to "—"

---

## 🎨 Visual Design Checklist

- [x] Colors match Teenage Engineering palette
- [x] Typography uses monospace throughout
- [x] No rounded corners (sharp edges)
- [x] Borders are 1px and subtle
- [x] Accent color used for active/highlight states
- [x] Spacing consistent with grid layout
- [x] Visual hierarchy clear (primary > secondary)
- [ ] All colors use CSS variables **⚠️ #111111 hardcoded for tooltip**
- [ ] All spacing uses CSS variables **⚠️ Currently hardcoded**

---

## 🔍 Code Quality Checklist

- [x] No console errors
- [ ] No unused variables/functions **⚠️ recalcTdsFromTemp may be redundant**
- [x] Event listeners properly attached
- [x] IIFE used for scope isolation
- [ ] CSS variables used consistently **⚠️ #111111 not using variable**
- [x] Responsive breakpoints logical
- [x] Semantic HTML elements used
- [x] Proper input attributes (step, min, max)

---

## 📝 Notes

- Implementation closely follows PLAN.md with minor deviations
- Code is clean, well-structured, and maintainable
- Mobile responsive design is implemented and verified across 3 viewports
- Core calculations are mostly correct (TDS→Brix temp compensation missing)
- Architecture could benefit from react-like unidirectional data flow
- CSS theming needs improvement with consistent variable usage
- All viewports tested successfully (Desktop 1365px, Tablet 768px, Mobile 375px)

---

## 🔄 Next Steps

1. Fix TDS → Brix temperature compensation
2. Consolidate syncBrixTds and recalcTdsFromTemp into single function
3. Refactor to react-like pattern (state mutation → render side effects)
4. Add immersion range to references table
5. Replace hardcoded CSS colors with variables
6. Add CSS spacing/font-size variables for consistency
7. Update page title to be user-friendly
8. Improve tooltip accessibility for touch devices
9. Test small mobile viewport (≤360px)
10. Consider adding keyboard navigation support

---

*Review completed: 2026-05-02*  
*Browser testing completed: 2026-05-02*  
*Next review iteration: TBD after fixes applied*