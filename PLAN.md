# Brix to Coffee TDS Calculator - Implementation Plan

## Overview
Single-page application to convert Brix % ↔ TDS % and calculate coffee extraction yield. Hosted at `wirasuta.github.io/brix-coffee-tds`.

---

## Design Language: Teenage Engineering

### Visual Characteristics
- **Background**: Dark (#1a1a1a or near-black)
- **Text**: White (#ffffff) for primary, muted gray (#888) for secondary
- **Accent color**: Orange (#ff6b35) for highlights, active states
- **Typography**: Monospace font (e.g., `JetBrains Mono`, `IBM Plex Mono`, or system monospace)
- **Layout**: Grid-based, structured like a control panel/instrument interface
- **UI elements**: Minimal, geometric, functional — no rounded corners, sharp edges
- **Borders**: Thin 1px lines, subtle separators
- **Icons**: Simple geometric shapes, emoji for reset (🔄)

### Layout Structure
```
──────────────────────────────────────────────────┐
│  brix-coffee-tds                          [🔄]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  ROW 1: BRIX / TDS (main inputs)           │  │
│  │                                            │  │
│  │  BRIX %          TDS %                     │  │
│  │  [______]   ↔   [______]                   │  │
│  │                                            │  │
│  │  (bidirectional — edit either, other syncs)│  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ────────────────────────────────────────────┐  │
│  │  ROW 2: EXTRACTION PARAMETERS              │  │
│  │                                            │  │
│  │  DOSE(g)   WATER(g)   METHOD    BREW(g)    │  │
│  │  [____]    [____]    [▼]       [____]      │  │
│  │                               (optional)   │  │
│  │                                            │  │
│  │  TEMP(°C)                                  │  │
│  │  [____] (optional)                         │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ────────────────────────────────────────────┐  │
│  │  ROW 3: EXTRACTION YIELD + QUALITY         │  │
│  │                                            │  │
│  │  EY: 20.4%          ● optimal              │  │
│  │  (18-22% target)                           │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ────────────────────────────────────────────┐  │
│  │  ▼ REFERENCES & FORMULAS (collapsible)     │  │
│  │  ───────────────────────────────────────── │  │
│  │  (collapsed by default)                    │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Mobile Layout
- Stack rows vertically (single column)
- Inputs full-width with labels above
- Maintain same visual hierarchy
- Touch-friendly input sizes (min 44px height)

---

## Functionality

### Row 1: Brix ↔ TDS (Always Active)
- Two number inputs side by side
- **Bidirectional sync**: editing Brix updates TDS, editing TDS updates Brix
- Formula: `TDS = Brix × 0.85` / `Brix = TDS / 0.85`
- Displays immediately — no other inputs required
- Arrow indicator (↔) between them showing bidirectional relationship

### Row 2: Extraction Parameters
| Field | Type | Required |
|-------|------|----------|
| Dose (g) | number | Yes |
| Water (g) | number | Yes |
| Method | select | Yes |
| Brew Weight (g) | number | No |
| Temperature (°C) | number | No |

Each field has a tooltip on hover explaining what it means:
- **Dose**: Weight of dry coffee grounds used for brewing
- **Water**: Total water weight used during brewing
- **Method**: Brew method — affects which extraction formula is used (Filter / Espresso / Immersion)
- **Brew Weight**: Actual beverage weight in the cup after filtering (optional — enables EEY calculation)
- **Temperature**: Sample temperature in °C — used for refractometer compensation (defaults to 20°C)

### Row 3: Extraction Yield + Quality Indicator
- **EY value**: Large, prominent display
- **Quality indicator**: Colored dot + label
  - `● under-extracted` (EY < 18%) — yellow (#f0c040)
  - `● optimal` (EY 18-22%) — green (#40f080)
  - `● over-extracted` (EY > 22%) — red (#f04040)
- Only displays when dose + water are provided
- If brew weight is provided, also show EEY below EY

### Reset Button
- Emoji: 🔄
- Top-right corner of the page
- Clears all inputs, resets to defaults

---

## Calculations

### Brix ↔ TDS
```
TDS = Brix × 0.85
Brix = TDS / 0.85
```

### Temperature Compensation
If temperature ≠ 20°C, apply correction to Brix before conversion:
```
correctionFactor = 1 + (temp - 20) × 0.0002
adjustedBrix = rawBrix / correctionFactor
```

### Extraction Yield (Precise Formula)
```
brewRatio = waterWeight / doseWeight
ey = (tds × brewRatio) / (1 - tds / 100)
```

### Effective Extraction Yield (Optional)
```
eey = (tds / 100) × brewWeight / doseWeight × 100
```

---

## References Section (Collapsible)

### Sources
1. **Khymos** — Martin Lersch, "Wonders of extraction: Coffee (part 1)"
2. **Complete Home Barista** — "Refractometer TDS Measurement: Espresso Extraction Guide"
3. **NISupply** — "Comparing Coffee Refractometers That Measure in TDS vs % Brix"
4. **BKON** — "Exploring the Correlation Between TDS and Brix"
5. **MTPak Coffee** — "Everything you need to know about Brix readings for coffee"
6. **Homeground Coffee Roasters** — "From Brix to TDS"
7. **DeepWiki (quantitativecafe)** — "TDS vs Brix Measurements"

### Formulas Displayed
```
Brix → TDS:    TDS % = Brix % × 0.85
TDS → Brix:    Brix % = TDS % / 0.85

Extraction Yield:
  EY = (TDS % × Brew Ratio) / (1 - TDS %)
  where Brew Ratio = Water Weight / Dose Weight

Effective Extraction Yield:
  EEY = (TDS % × Brew Weight) / Dose Weight

Temperature Compensation:
  Adjusted Brix = Raw Brix / (1 + (Temp - 20) × 0.0002)
```

### Typical Ranges Reference
| Brew Type | TDS Range | Target EY |
|-----------|-----------|-----------|
| Filter coffee | 1.15–1.45% | 18–22% |
| Espresso | 7–12% | 18–22% |

---

## Technical Requirements

### Hosting
- Static site (HTML + CSS + JS, no build step required)
- Compatible with GitHub Pages
- Repository: `wirasuta/brix-coffee-tds`

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)

### File Structure
```
brix-coffee-tds/
├── index.html    # Single page application
├── style.css     # Teenage Engineering-inspired styles
└── app.js        # Calculation logic
```

---

## Implementation Order
1. HTML structure with three-row layout + collapsible references
2. CSS with Teenage Engineering design language (dark, monospace, grid)
3. Brix ↔ TDS bidirectional sync logic
4. Extraction yield calculation (precise formula)
5. Quality indicator with color states
6. Temperature compensation
7. Reset button functionality
8. Mobile responsive adjustments
9. References section content and collapse behavior
