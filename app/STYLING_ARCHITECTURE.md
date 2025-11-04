# Clearline Church Platform - Styling Architecture Diagram

## Visual Overview of Styling System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STYLING LAYER ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

                            HTML/JSX Components
                                    ▲
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            Page Components    Layout             Reusable
            (8 files)          Components         Components
                               (3 files)          (2 files)
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                                    ▼
                        Tailwind CSS Classes
                        (Utility-First)
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            Component Layer  Theme Variables  Utility Classes
            (@layer)         (color palette)  (responsive)
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │  tailwind.config.ts             │
                    │  - Primary color palette        │
                    │  - Theme extensions            │
                    │  - Content paths               │
                    └─────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │  src/app/globals.css            │
                    │  - @layer base                  │
                    │  - @layer components            │
                    │  - Color variable overrides     │
                    └─────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │  postcss.config.js              │
                    │  - Tailwind processor           │
                    │  - Autoprefixer                 │
                    └─────────────────────────────────┘
                                    │
                                    ▼
                        Compiled CSS (output)
```

---

## Current Color Hierarchy

```
┌────────────────────────────────────────────────────────────────┐
│                    COLOR SYSTEM OVERVIEW                        │
└────────────────────────────────────────────────────────────────┘

PRIMARY COLOR (Sky Blue) - Defined in tailwind.config.ts
├── 50:  #f0f9ff (Lightest - backgrounds)
├── 100: #e0f2fe
├── 200: #bae6fd
├── 300: #7dd3fc
├── 400: #38bdf8
├── 500: #0ea5e9 (Main)
├── 600: #0284c7 (Most Used - buttons, links)
├── 700: #0369a1 (Hover states)
├── 800: #075985
└── 900: #0c4a6e (Darkest - text)

SEMANTIC COLORS (Tailwind Defaults - NOT configured)
├── Green   (#10b981) - Success, Active status
├── Red     (#ef4444) - Danger, Error
├── Blue    (#3b82f6) - Info
├── Yellow  (#eab308) - Warning
├── Purple  (#a855f7) - Special (Admin role)
└── Gray    (#6b7280) - Neutral, Inactive

USAGE PATTERNS:
├── Primary brand/action: primary-600, primary-500
├── Hover/focus: primary-700, primary-400
├── Backgrounds: primary-50, gray-50, white
├── Text: gray-900, gray-600, gray-500
├── Borders: gray-200, primary-300
└── Status badges: green/red/gray/purple combos
```

---

## Data Flow: From Config to UI

```
tailwind.config.ts (color definitions)
        │
        │ Defines: primary: { 50: ..., 600: ..., etc }
        │
        ▼
globals.css (@layer directives)
        │
        │ Uses: @apply bg-primary-600, @apply text-white, etc
        │
        ▼
.btn-primary class { @apply bg-primary-600 ... }
        │
        │ Buttons use this class name
        │
        ▼
JSX: <button className="btn-primary">Click me</button>
        │
        │ Inline + component classes combined
        │
        ▼
PostCSS processing (tailwind, autoprefixer)
        │
        │ Generates: .btn-primary { background-color: #0284c7; ... }
        │
        ▼
Compiled CSS (dist/output)
        │
        │ Browser loads and applies styles
        │
        ▼
Rendered UI with brand colors
```

---

## File Dependency Graph

```
┌──────────────────────────────────────────────────────────────────┐
│                    STYLING FILES & DEPENDENCIES                  │
└──────────────────────────────────────────────────────────────────┘

                        tailwind.config.ts ◄──── Primary
                              ▲                   (Foundation)
                              │
                              │ Extends
                              │
                        postcss.config.js ◄──── PostCSS
                              ▲
                              │ Processes
                              │
                      src/app/globals.css ◄──── Global Styles
                              ▲
                              │ Imports
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
      Navbar.tsx      Toast.tsx           Pages
      (component)     (component)         (8 pages)
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
                    Uses Tailwind classes
                    + inline @apply
                              │
                              ▼
                    Browser renders final UI
```

---

## Component Class Layer Structure

```
┌─────────────────────────────────────────────────────────────────┐
│               COMPONENT CLASSES (@layer components)              │
└─────────────────────────────────────────────────────────────────┘

globals.css defines:

.btn                         (base button)
├── padding: px-4 py-2
├── border-radius: rounded-lg
├── font-weight: font-medium
├── transition: transition-colors
└── focus: focus:outline-none focus:ring-2

.btn-primary                 (primary action)
├── extends: .btn
├── background: bg-primary-600
├── text-color: text-white
├── hover: hover:bg-primary-700
└── focus-ring: focus:ring-primary-500

.btn-secondary               (secondary action)
├── extends: .btn
├── background: bg-gray-200
├── text-color: text-gray-900
├── hover: hover:bg-gray-300
└── focus-ring: focus:ring-gray-500

.btn-danger                  (destructive action)
├── extends: .btn
├── background: bg-red-600
├── text-color: text-white
├── hover: hover:bg-red-700
└── focus-ring: focus:ring-red-500

.input                       (form input)
├── width: w-full
├── padding: px-3 py-2
├── border: border border-gray-300
├── border-radius: rounded-lg
├── focus-ring: focus:ring-2 focus:ring-primary-500
└── focus-border: focus:border-transparent

.label                       (form label)
├── display: block
├── font-size: text-sm
├── font-weight: font-medium
├── text-color: text-gray-700
└── margin: mb-1

.card                        (content container)
├── background: bg-white
├── border-radius: rounded-lg
├── shadow: shadow-sm
└── padding: p-6
```

---

## Color Update Impact Map

```
┌────────────────────────────────────────────────────────────────┐
│         IF YOU CHANGE PRIMARY COLOR IN tailwind.config.ts      │
└────────────────────────────────────────────────────────────────┘

Changes automatically applied to:
├── Primary buttons (.btn-primary) ✓
├── Input focus rings (.input:focus) ✓
├── Primary links (text-primary-600) ✓
├── Link hover states (hover:text-primary-500) ✓
├── Navigation active state (border-primary-500) ✓
├── Card hover effects (hover:border-primary-300) ✓
├── All components using primary palette ✓
└── Dashboard, People, Services, Groups pages ✓

NO additional changes needed!

─────────────────────────────────────────────────────

IF YOU ALSO NEED TO UPDATE SEMANTIC COLORS
(green for success, red for error, etc.)

Must manually update in these locations:
├── Toast.tsx (line 41-50) - success/error/info colors
├── Dashboard page (line 143-206) - icon badge colors
├── Settings/users page (line 65-78) - role badge colors
├── People page (line 127-131) - status badge colors
├── Groups page (line 61-65) - open/closed badge colors
└── Consider: Extract to lib/colors.ts for maintainability
```

---

## Responsive Design Breakpoints

```
Mobile First Approach:
┌──────────────────────────────────────────────────────────┐

Default (Mobile)          < 640px
├── Single column layouts
├── Smaller text sizes
├── Full-width components
└── Touch-friendly spacing

sm: breakpoint            ≥ 640px
├── Small tablets
├── Some layout adjustments
└── Hover states enabled

md: breakpoint            ≥ 768px
├── Tablets
├── 2-column grid layouts
├── Sidebar navigation
└── Most common layout shift

lg: breakpoint            ≥ 1024px
├── Desktops
├── 3-4 column grid layouts
├── Horizontal navigation
└── Wide content containers

xl: breakpoint            ≥ 1280px
├── Large screens
├── Max-width constraints
└── Spacious layouts
```

**Example from codebase:**
```html
<!-- Dashboard cards: 1 col on mobile, 2 on sm, 4 on lg -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6">

<!-- Groups: 1 col on mobile, 2 on md, 3 on lg -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Services table: hides on mobile via overflow-x-auto -->
<div class="overflow-x-auto">
  <table class="min-w-full ...">
```

---

## Typography System

```
┌───────────────────────────────────────────────────────────────┐
│                    FONT & TEXT HIERARCHY                       │
└───────────────────────────────────────────────────────────────┘

FONT STACK:
Inter (Google Fonts) - Single font family
├── Weight 400 - Regular text
├── Weight 500 - Medium (form labels)
├── Weight 600 - Semibold (section headings, nav)
└── Weight 700 - Bold (page titles, strong text)

FONT SIZES (Tailwind defaults):
├── text-xs   - 12px (captions, metadata)
├── text-sm   - 14px (labels, secondary text)
├── text-base - 16px (body text)
├── text-lg   - 18px (section titles)
├── text-xl   - 20px (card titles)
├── text-2xl  - 24px (page subtitles)
├── text-3xl  - 30px (page titles)
└── text-4xl  - 36px (not used in current design)

TYPICAL HIERARCHY:
Page Title:      text-3xl font-bold text-gray-900
Section Head:    text-lg font-semibold text-gray-900
Body Text:       text-base text-gray-600
Secondary:       text-sm text-gray-500
Label:           text-sm font-medium text-gray-700
Caption:         text-xs text-gray-500

CURRENT USAGE IN CODEBASE:
Dashboard greeting:     text-3xl font-bold
Page titles:            text-3xl font-bold
Card titles:            text-lg font-semibold
Nav items:              text-sm font-medium
Form labels:            .label class (text-sm)
Table headers:          text-xs font-medium uppercase
Empty states:           text-gray-500
```

---

## Spacing & Layout System

```
┌───────────────────────────────────────────────────────────────┐
│                      SPACING SCALE                             │
└───────────────────────────────────────────────────────────────┘

Tailwind uses 0.25rem (4px) base unit:
├── p-1 (0.25rem = 4px)
├── p-2 (0.5rem = 8px)
├── p-3 (0.75rem = 12px)
├── p-4 (1rem = 16px)
├── p-6 (1.5rem = 24px)
├── p-8 (2rem = 32px)
└── And continues...

COMMON PATTERNS IN CLEARLINE:
Padding:
├── Buttons:          px-4 py-2     (16px x 8px)
├── Form inputs:      px-3 py-2     (12px x 8px)
├── Cards:            p-6           (24px all sides)
├── Page sections:    px-4 py-6     (16px x 24px)
└── Table cells:      px-6 py-4     (24px x 16px)

Gaps (between items):
├── Small gap:        gap-2 / gap-3
├── Standard gap:     gap-4 / gap-6 (most common)
├── Large gap:        gap-8
└── Vertical gap:     space-y-6, space-y-8

Margins:
├── Between sections: mb-4, mb-6
├── Nav items:        space-x-8 (horizontal)
├── Form groups:      space-y-4 (vertical)
└── Page margins:     mx-auto px-4

Max-width constraint:
├── App container:    max-w-7xl mx-auto
├── Form containers:  max-w-md
└── Responsive:       Default full-width, then constrained
```

---

## Shadow & Border System

```
┌───────────────────────────────────────────────────────────────┐
│                    SHADOWS & BORDERS                           │
└───────────────────────────────────────────────────────────────┘

SHADOWS (used sparingly):
├── shadow-sm       - Subtle (cards, buttons) - MOST COMMON
├── shadow          - Medium (modals, lifted states)
├── shadow-md       - Larger (dropdown menus, etc)
├── shadow-lg       - Large (not used in current design)
└── No shadow       - Flat design for most elements

CURRENT USAGE:
├── Cards:          shadow-sm (subtle depth)
├── Toast alerts:   shadow-lg (prominent notification)
├── Most UI:        border instead of shadow
└── Hover states:   shadow-md transition-shadow

BORDERS:
├── Border color:   border-gray-200 (most common)
├── Border width:   border (1px default)
├── Special:        border-l-4 (toast left accent)
├── Style:          solid only
├── Active state:   border-primary-300 (hover effects)
└── Focus rings:    focus:ring-2 (not a border)

BORDER RADIUS:
├── rounded         - 4px (minimal)
├── rounded-lg      - 8px (MOST COMMON)
├── rounded-full    - 50% (badge pills, avatars)
└── No rounding     - Tables, some lists

TYPICAL PATTERNS:
Card:             bg-white rounded-lg shadow-sm
Button:           rounded-lg border-0
Input:            rounded-lg border border-gray-300
Badge:            rounded-full
Alert:            rounded-lg border-l-4
Table:            border-separate border-spacing-0
```

---

## Accessibility Considerations

```
┌───────────────────────────────────────────────────────────────┐
│                  CURRENT A11Y FEATURES                         │
└───────────────────────────────────────────────────────────────┘

Color Contrast:
├── Text-gray-900 on bg-white:    Good (AAA)
├── Text-gray-600 on bg-white:    Good (AA)
├── Text-white on primary-600:    Good (AAA)
├── Status badges:                Good (AA minimum)
└── Verify before shipping:       Use WCAG checker

Focus States:
├── All buttons:   focus:ring-2 focus:ring-offset-2
├── All inputs:    focus:ring-2 focus:ring-primary-500
├── Links:         Focus ring visible
└── Problem:       Some interactive elements might lack focus

Semantic HTML:
├── Buttons:       <button> tags (not divs)
├── Links:         <Link> from Next.js
├── Form:          Proper <label> associations
├── Tables:        Proper <thead>, <tbody>
└── Headings:      Proper hierarchy (h1, h2, h3)

To Improve:
├── Add aria-labels to icon buttons
├── Add skip-to-content links
├── Ensure keyboard navigation works
├── Test with screen readers
└── Verify color contrast ratios
```

---

## Performance Implications

```
┌───────────────────────────────────────────────────────────────┐
│              STYLING PERFORMANCE NOTES                         │
└───────────────────────────────────────────────────────────────┘

CURRENT SETUP:
├── Tailwind CSS JIT mode (just-in-time)
├── Only used classes included in output
├── CSS file typically 50-100KB (gzipped: 15-30KB)
├── PostCSS + Autoprefixer processing
└── No CSS-in-JS runtime overhead

INLINE STYLES IMPACT:
├── Heavy use of inline className strings
├── No runtime style generation
├── Static classes (good for tree-shaking)
├── Could be optimized with CSS modules
└── Current: Acceptable performance

OPTIMIZATION OPPORTUNITIES:
├── Extract repeated patterns to @layer components
├── Use CSS modules for page-specific styles
├── Lazy load component CSS (less impactful here)
├── Minimize className strings (e.g., use const objects)
└── Current implementation is reasonable for MVP

KEY MEASUREMENTS:
├── Color palette changes: ZERO runtime cost
├── Component class updates: Zero runtime cost
├── Adding new Tailwind utilities: Adds ~1-2KB per utility group
└── Switching fonts: Adds 50-100KB (Inter already loaded)
```

---

## Summary Statistics

```
Styling Metrics:
├── Total Tailwind utility classes used:     ~80+
├── Custom component classes defined:        7 (.btn, .input, etc)
├── Color definitions in config:             1 palette (9 shades)
├── CSS files:                               1 (globals.css)
├── Responsive breakpoints used:             3 (sm, md, lg)
├── TypeScript styling files:                0 (pure Tailwind)
├── Hard-coded color references:             15+ locations
├── Pages/components needing updates:        ~10 files

Maintenance Burden:
├── To update primary color:                 1 file (tailwind.config.ts)
├── To update button styles:                 1 file (globals.css)
├── To update semantic colors:               5 files (scattered)
├── To update typography:                    1 file (layout.tsx)
├── Full rebrand effort:                     2-4 hours

Code Quality:
├── DRY principle adherence:                 Medium (some duplication)
├── Maintainability:                         Good (clear patterns)
├── Scalability:                             Good (Tailwind scales well)
├── Browser compatibility:                   Good (Autoprefixer)
└── Future-proofing:                         Good (standard setup)
```

