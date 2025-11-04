# Brand Guidelines Update - Implementation Guide

## Quick Reference: Where to Update Styling

This guide helps you systematically update the Clearline Church Platform to match brand guidelines.

---

## Phase 1: Configuration Files (Foundation)

### 1. Tailwind Color Palette
**File:** `/Users/petie/Documents/clearline-church/tailwind.config.ts`

**Current State:**
```typescript
colors: {
  primary: {
    50: '#f0f9ff',   // Sky blue
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main
    600: '#0284c7',  // Used most
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
}
```

**What to Update:**
- Replace primary color palette with brand primary color
- Add secondary color palette if needed
- Define accent colors
- Define neutral/gray overrides if brand specifies
- Consider adding semantic colors (success, warning, error, info)

---

## Phase 2: Component Layer Styles (Reusable Components)

### 2. Global CSS Component Classes
**File:** `/Users/petie/Documents/clearline-church/src/app/globals.css`

**Current Component Classes to Update:**

```css
@layer components {
  /* Button Styles */
  .btn { }              /* Base button */
  .btn-primary { }      /* Primary action (currently sky blue) */
  .btn-secondary { }    /* Secondary action (currently gray) */
  .btn-danger { }       /* Destructive action (currently red) */

  /* Form Elements */
  .input { }            /* Text inputs */
  .label { }            /* Form labels */

  /* Containers */
  .card { }             /* Content cards (white bg, shadow, padding) */
}
```

**Update Strategy:**
- Preserve button naming but update colors
- Consider adding new button variants if brand has them
- Update focus ring colors to use new primary
- Update hover states to match brand guidelines
- Review shadows to match design system (if specified)

---

## Phase 3: Component File Updates (2 files)

### 3. Navbar Component
**File:** `/Users/petie/Documents/clearline-church/src/components/Navbar.tsx` (lines 70-96)

**Current Colors:**
- Logo: `text-primary-600` (link color, sky blue)
- Active nav link: `border-primary-500`, `text-gray-900`
- Hover state: `border-transparent text-gray-500 hover:border-gray-300`

**Areas to Update:**
```typescript
// Line 70: Logo color
<Link href="/dashboard" className="text-xl font-bold text-primary-600">

// Line 81: Active nav indicator
border-primary-500 text-gray-900

// Line 94: Logout button uses .btn-secondary class
className="btn-secondary text-sm"
```

### 4. Toast Component
**File:** `/Users/petie/Documents/clearline-church/src/components/Toast.tsx` (lines 41-50)

**Current Color Mapping:**
```typescript
const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success': return 'bg-green-50 border-green-500 text-green-800'
    case 'error':   return 'bg-red-50 border-red-500 text-red-800'
    case 'info':    return 'bg-blue-50 border-blue-500 text-blue-800'
  }
}
```

**Update Considerations:**
- Keep semantic color meanings (green=success, red=error, blue=info)
- OR update to use brand color scheme
- Maintain sufficient contrast for accessibility

---

## Phase 4: Layout Files

### 5. Root Layout
**File:** `/Users/petie/Documents/clearline-church/src/app/layout.tsx`

**Current Typography:**
- Font: Inter (Google Fonts) - may need to update to brand font
- Applied: `<body className={inter.className}>`

**If Brand Font is Different:**
- Import new font from Google Fonts or @font-face
- Update className

### 6. App Layout
**File:** `/Users/petie/Documents/clearline-church/src/app/(app)/layout.tsx`

**Current Colors:**
- Background: `bg-gray-50`
- This is applied to main content area

**Update:**
- Consider brand background color
- Update to match color palette

---

## Phase 5: Page Component Updates (8 pages)

### Critical Color References in Pages

Each page file contains inline Tailwind classes with these patterns:

#### A. Navigation/Links
- `text-primary-600` - primary links
- `hover:text-primary-500` - link hover states
- `text-primary-600 hover:text-primary-700` - nav active states

**Files:** All pages using links

#### B. Buttons
- `.btn-primary` - main action buttons (automatically updated via globals.css)
- `.btn-secondary` - secondary actions (automatically updated)
- Other: `.btn-danger` for destructive actions

**Files:** All pages

#### C. Status/Role Badge Colors

**Location 1:** `/src/app/(app)/settings/users/page.tsx` (lines 65-78)
```typescript
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':  return 'bg-purple-100 text-purple-800'
    case 'leader': return 'bg-blue-100 text-blue-800'
    case 'member': return 'bg-green-100 text-green-800'
    case 'viewer': return 'bg-gray-100 text-gray-800'
  }
}
```

**Location 2:** `/src/app/(app)/people/page.tsx` (lines 127-131)
```typescript
person.status === 'active'
  ? 'bg-green-100 text-green-800'
  : 'bg-gray-100 text-gray-800'
```

**Location 3:** `/src/app/(app)/groups/page.tsx` (lines 61-65)
```typescript
group.isOpen
  ? 'bg-green-100 text-green-800'
  : 'bg-gray-100 text-gray-800'
```

**Update Strategy:**
- Extract to utility function: `lib/colors.ts`
- Create semantic color constants
- Update at source instead of in multiple places

#### D. Dashboard Icon Badge Colors

**Location:** `/src/app/(app)/dashboard/page.tsx`

```typescript
// People card - Blue
<div className="p-3 bg-blue-100 rounded-full">
  <svg className="w-6 h-6 text-blue-600" />

// Groups card - Green
<div className="p-3 bg-green-100 rounded-full">
  <svg className="w-6 h-6 text-green-600" />

// Services card - Purple
<div className="p-3 bg-purple-100 rounded-full">
  <svg className="w-6 h-6 text-purple-600" />

// Users card - Orange
<div className="p-3 bg-orange-100 rounded-full">
  <svg className="w-6 h-6 text-orange-600" />
```

**Options:**
- Keep as semantic colors (people=blue, groups=green, etc.)
- Extract to function: `dashboardIconColors.ts`
- Map to brand color palette

---

## Phase 6: Copy/Content Updates (Optional)

### Hard-Coded Text Locations

If brand guidelines specify updated messaging:

1. **Page Headers** (page titles and descriptions)
2. **Navigation Labels** - `Navbar.tsx`
3. **Button Labels** - throughout components
4. **Toast Messages** - `Toast.tsx`
5. **Greeting Messages** - `dashboard/page.tsx`
6. **Empty States** - "No people found", etc.

**Note:** All copy is currently hard-coded in components. Consider creating an i18n setup for future flexibility.

---

## Update Checklist

### Phase 1: Configuration
- [ ] Update `tailwind.config.ts` with brand color palette
- [ ] Test colors are visible in UI
- [ ] Verify Tailwind color scale (50-900)

### Phase 2: Component Layer
- [ ] Update `globals.css` button classes
- [ ] Update input/form styles if needed
- [ ] Update card/container styles
- [ ] Run build to check for any CSS errors

### Phase 3: Component Files
- [ ] Update `Navbar.tsx` color references
- [ ] Update `Toast.tsx` if using brand colors for status
- [ ] Test navigation highlighting
- [ ] Test toast notifications

### Phase 4: Layouts
- [ ] Update `layout.tsx` font if needed
- [ ] Update app layout background if needed

### Phase 5: Page Updates
- [ ] Create `lib/colors.ts` utility (recommended)
- [ ] Update all link colors (search for `text-primary-`)
- [ ] Extract badge color logic to functions
- [ ] Update dashboard icon colors
- [ ] Update status indicators
- [ ] Test responsive design on all breakpoints

### Phase 6: Content (Optional)
- [ ] Update page copy if needed
- [ ] Review all user-facing text
- [ ] Consider i18n setup

### Final Testing
- [ ] Visual regression testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Accessibility contrast checks
- [ ] Focus states visibility

---

## Recommended: Create Color Utility File

### New File: `/src/lib/colors.ts`

```typescript
// Semantic color mappings
export const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  leader: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
} as const

export const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
} as const

export const dashboardIconColors = {
  people: { bg: 'bg-blue-100', text: 'text-blue-600' },
  groups: { bg: 'bg-green-100', text: 'text-green-600' },
  services: { bg: 'bg-purple-100', text: 'text-purple-600' },
  users: { bg: 'bg-orange-100', text: 'text-orange-600' },
} as const
```

### Update Components to Use

**Before (in `/src/app/(app)/settings/users/page.tsx`):**
```typescript
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800'
    // ...
  }
}
```

**After:**
```typescript
import { roleColors } from '@/lib/colors'

// In component:
className={roleColors[invite.role as keyof typeof roleColors]}
```

---

## File Reference Matrix

### Quick Lookup: Where to Find Each Color Type

| Color Type | Primary File | Secondary Files | Line Numbers |
|-----------|-------------|-----------------|-------------|
| Primary color palette | `tailwind.config.ts` | All component files | N/A |
| Button colors | `globals.css` | All pages | Various |
| Link colors | All pages | `Navbar.tsx` | 70, 81, 139 |
| Status badges | `settings/users/page.tsx` | `people/page.tsx`, `groups/page.tsx` | 65-78, 127-131, 61-65 |
| Dashboard icons | `dashboard/page.tsx` | N/A | 143-206 |
| Toast colors | `Toast.tsx` | N/A | 41-50 |
| Background colors | `globals.css` + `layout.tsx` | All pages | Various |

---

## Key Measurements

**Spacing System:**
- Uses Tailwind default (0.25rem = 4px increments)
- Most common: `p-6` (24px), `gap-6` (24px), `px-4 py-2` (16px x 8px)

**Typography:**
- Font: Inter (Google Fonts)
- Sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-3xl`
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

**Border Radius:**
- Primary: `rounded-lg` (8px)
- Also: `rounded-full` (pills), `rounded` (4px)

**Shadows:**
- `shadow-sm` - most common for cards
- `shadow-md`, `shadow-lg` - less common

**Responsive Breakpoints:**
- `sm:` (640px), `md:` (768px), `lg:` (1024px)

---

## Next Steps

1. **Gather Brand Guidelines**: Get official color palette, typography, and spacing specs
2. **Create Tailwind Config**: Update primary/secondary colors
3. **Update Component Classes**: globals.css button and form styles
4. **Create Color Utility**: lib/colors.ts for semantic mappings
5. **Update Components**: Navbar, Toast, and all pages
6. **Testing**: Visual QA and accessibility checks
7. **Document**: Update design system docs

---

**Total Files to Update:** ~15 files  
**Estimated Effort:** 2-4 hours (depending on guideline complexity)  
**Risk Level:** Low (all changes isolated to styling)

