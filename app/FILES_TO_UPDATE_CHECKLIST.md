# Brand Guidelines Update - Files Checklist

## Document Overview

This checklist helps you track which files need to be updated and in what order when implementing brand guidelines. Documents have been created to guide you through the update process:

1. **CODEBASE_STYLING_GUIDE.md** - Comprehensive overview of current styling system
2. **STYLING_UPDATE_GUIDE.md** - Step-by-step update instructions by phase
3. **STYLING_ARCHITECTURE.md** - Visual diagrams and architecture explanation
4. **FILES_TO_UPDATE_CHECKLIST.md** - This file

---

## Phase 1: Foundation Files (Update First)

These files define the color palette and component base styles. Changes here cascade throughout the app.

### File 1: Tailwind Configuration
**Path:** `/Users/petie/Documents/clearline-church/tailwind.config.ts`
**Priority:** CRITICAL - Update first
**Current State:** Defines primary color (sky blue) palette
**Action:**
- [ ] Replace primary color palette with brand colors
- [ ] Add secondary colors if needed
- [ ] Add/modify semantic colors (success, error, warning, info)
- [ ] Test build after changes

**Size:** Small (~30 lines)
**Complexity:** Low
**Risk:** Very Low (isolated config file)

---

### File 2: Global CSS & Component Styles
**Path:** `/Users/petie/Documents/clearline-church/src/app/globals.css`
**Priority:** CRITICAL - Update second
**Current State:** Contains @layer directives for buttons, inputs, cards, labels
**Action:**
- [ ] Update `.btn-primary` background and hover colors
- [ ] Update `.btn-secondary` if brand specifies different secondary color
- [ ] Update `.btn-danger` if needed
- [ ] Update `.input` focus ring color
- [ ] Review `.card` shadow if brand has spacing guidelines
- [ ] Test form elements after changes

**Size:** Small (~45 lines)
**Complexity:** Low
**Risk:** Low (clearly defined components)

**Component Classes to Update:**
```
.btn                  - Base button
.btn-primary          - Primary action
.btn-secondary        - Secondary action
.btn-danger           - Destructive action
.input                - Form inputs
.label                - Form labels
.card                 - Card containers
```

---

## Phase 2: Component Files (Update Second)

These files contain reusable UI components with styling.

### File 3: Navbar Component
**Path:** `/Users/petie/Documents/clearline-church/src/components/Navbar.tsx`
**Priority:** HIGH - Update third
**Current State:** Navigation with brand/org name, nav links, user info, logout button
**Areas with Color References:**
- Line 70: Logo text color (`text-primary-600`)
- Line 81: Active nav link color (`border-primary-500`)
- Line 94: Logout button (uses `.btn-secondary` class)

**Action:**
- [ ] Verify logo color uses primary color from palette
- [ ] Check nav active indicator uses primary color
- [ ] Button styling should auto-update from globals.css
- [ ] Test hover and active states
- [ ] Test on mobile (responsive nav)

**Size:** Medium (~100 lines)
**Complexity:** Low
**Risk:** Low (styling is secondary to functionality)

---

### File 4: Toast Component
**Path:** `/Users/petie/Documents/clearline-church/src/components/Toast.tsx`
**Priority:** MEDIUM - Update fourth
**Current State:** Notification toasts with success/error/info types
**Color Mappings:**
- Line 41-50: `getToastStyles()` function
  - Success: Green (#10b981 based)
  - Error: Red (#ef4444 based)
  - Info: Blue (#3b82f6 based)

**Action:**
- [ ] Decide: Keep semantic colors OR use brand color scheme
- [ ] If keeping semantic: Verify colors meet accessibility standards
- [ ] If switching: Update CSS for toast backgrounds
- [ ] Test all toast types (success, error, info)
- [ ] Verify color contrast for accessibility

**Size:** Small (~100 lines)
**Complexity:** Low
**Risk:** Low (isolated component)

---

## Phase 3: Layout Files (Update Third)

### File 5: Root Layout
**Path:** `/Users/petie/Documents/clearline-church/src/app/layout.tsx`
**Priority:** MEDIUM - Typography
**Current State:** Loads Inter font from Google Fonts
**Action:**
- [ ] Check if brand specifies different font
- [ ] If yes: Replace Inter import with brand font
- [ ] If no: Leave as-is (Inter is suitable default)
- [ ] Verify font loads correctly
- [ ] Test on multiple devices

**Size:** Tiny (~23 lines)
**Complexity:** Low
**Risk:** Low

---

### File 6: App Layout
**Path:** `/Users/petie/Documents/clearline-church/src/app/(app)/layout.tsx`
**Priority:** MEDIUM - Background color
**Current State:** Sets background to `bg-gray-50`
**Action:**
- [ ] Check if brand specifies background color
- [ ] Update if needed (e.g., white, different gray, brand color variant)
- [ ] Ensure good contrast with content
- [ ] Test readability

**Size:** Tiny (~18 lines)
**Complexity:** Very Low
**Risk:** Very Low

---

## Phase 4: Page Components (Update Fourth)

These files contain most of the UI and have many inline color references.

### File 7: Dashboard Page
**Path:** `/Users/petie/Documents/clearline-church/src/app/(app)/dashboard/page.tsx`
**Priority:** HIGH - Core page with many colors
**Current State:** Overview page with stats cards and activity feed
**Color References:**
- Line 149, 169, 189, 209: `text-primary-600` links (should auto-update)
- Lines 143-146: People card - Blue icon `text-blue-600`, `bg-blue-100`
- Lines 163-166: Groups card - Green icon `text-green-600`, `bg-green-100`
- Lines 183-186: Services card - Purple icon `text-purple-600`, `bg-purple-100`
- Lines 203-206: Users card - Orange icon `text-orange-600`, `bg-orange-100`
- Line 237: Hover effects use `hover:border-primary-300 hover:bg-primary-50`
- Lines 291-332: Quick action buttons use `.btn-primary`

**Action:**
- [ ] Primary links should update automatically
- [ ] Verify hover effects look good
- [ ] Update icon colors if brand specifies different mapping
- [ ] Options:
  - [ ] Keep current semantic colors (blue=people, green=groups, etc)
  - [ ] Extract to utility function `lib/dashboardColors.ts`
  - [ ] Update all to brand colors
- [ ] Test responsive grid at all breakpoints

**Size:** Large (~340 lines)
**Complexity:** Medium
**Risk:** Medium (multiple color references scattered throughout)

---

### File 8: People List Page
**Path:** `/Users/petie/Documents/clearline-church/src/app/(app)/people/page.tsx`
**Priority:** HIGH - Core page with status badge
**Current State:** Table of church people/contacts
**Color References:**
- Line 45, 51: `.btn-primary` and `.btn-secondary` buttons (auto-update)
- Line 111: Primary tags `bg-primary-100 text-primary-800`
- Lines 127-131: Status badge colors
  ```typescript
  person.status === 'active'
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800'
  ```

**Action:**
- [ ] Buttons should auto-update from globals.css
- [ ] Primary tags should auto-update if using primary palette
- [ ] Status badges: Extract to `lib/colors.ts` function
- [ ] Test all status combinations
- [ ] Verify accessible color contrast

**Size:** Medium (~150 lines)
**Complexity:** Low
**Risk:** Low

---

### File 9: Services List Page
**Path:** `/Users/petie/Documents/clearline-church/src/app/(app)/services/page.tsx`
**Priority:** MEDIUM - Simpler page
**Current State:** List of worship services
**Color References:**
- Line 36: `.btn-primary` (auto-updates)
- Line 57: `.card` (auto-updates from globals.css)
- Line 237: Hover effects `hover:border-primary-300 hover:bg-primary-50`

**Action:**
- [ ] Components should auto-update
- [ ] Test hover effects
- [ ] Verify responsive layout

**Size:** Small (~80 lines)
**Complexity:** Very Low
**Risk:** Very Low

---

### File 10: Groups List Page
**Path:** `/Users/petie/Documents/clearline-church/src/app/(app)/groups/page.tsx`
**Priority:** MEDIUM - Status badges
**Current State:** Grid of small groups
**Color References:**
- Line 36: `.btn-primary` (auto-updates)
- Line 56: `.card` (auto-updates)
- Lines 61-65: Open/Closed status badge
  ```typescript
  group.isOpen
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800'
  ```

**Action:**
- [ ] Extract status colors to `lib/colors.ts`
- [ ] Test all combinations
- [ ] Verify accessible contrast

**Size:** Small (~90 lines)
**Complexity:** Low
**Risk:** Low

---

### File 11: Settings Page
**Path:** `/Users/petie/Documents/clearline-church/src/app/(app)/settings/page.tsx`
**Priority:** LOW - Placeholder page
**Current State:** Basic settings layout
**Action:**
- [ ] No critical color updates needed
- [ ] May need future updates when features implemented

**Size:** Small
**Complexity:** Very Low
**Risk:** Very Low

---

### File 12: Settings - Users/Invites Page
**Path:** `/Users/petie/Documents/clearline-church/src/app/(app)/settings/users/page.tsx`
**Priority:** HIGH - Role badge colors
**Current State:** User management with role badges
**Color References:**
- Lines 65-78: Role badge color function
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

**Action:**
- [ ] Extract this function to `lib/colors.ts`
- [ ] Create role color constants
- [ ] Decide: Keep semantic colors or use brand colors
- [ ] Update all references
- [ ] Test all role types

**Size:** Medium (~250 lines)
**Complexity:** Low
**Risk:** Low (function is well-isolated)

---

### Files 13-16: Additional Pages (Detail Pages)
**Paths:**
- `/src/app/(app)/people/new/page.tsx`
- `/src/app/(app)/people/[id]/page.tsx`
- `/src/app/(app)/people/[id]/edit/page.tsx`
- `/src/app/(app)/services/new/page.tsx`
- `/src/app/(app)/services/[id]/page.tsx`
- `/src/app/(app)/groups/new/page.tsx`
- `/src/app/(app)/groups/[id]/page.tsx`
- `/src/app/(app)/people/import/page.tsx`

**Priority:** MEDIUM
**Current State:** Forms and detail views
**Action:**
- [ ] Review each for `.btn-primary`, `.btn-secondary`, `.input` usage
- [ ] Most should auto-update from globals.css
- [ ] Check for any hardcoded colors
- [ ] Test forms with new color scheme

**Complexity:** Low per file
**Risk:** Low

---

## Phase 5: Authentication Pages

### Files 17-18: Login & Register Pages
**Paths:**
- `/Users/petie/Documents/clearline-church/src/app/(auth)/login/page.tsx`
- `/Users/petie/Documents/clearline-church/src/app/(auth)/register/page.tsx`

**Priority:** MEDIUM - Public-facing pages
**Current State:** Auth forms
**Color References:**
- `.btn-primary` (auto-updates)
- `.input`, `.label` (auto-update)
- Primary links and text

**Action:**
- [ ] Review both pages for consistency
- [ ] Test form styling with new colors
- [ ] Ensure brand presentation on login/signup

**Size:** Medium each
**Complexity:** Low
**Risk:** Low

---

## Optional: Create Utility Files

### File 19: Color Utility File (RECOMMENDED)
**Path:** `/Users/petie/Documents/clearline-church/src/lib/colors.ts` (NEW FILE)
**Priority:** RECOMMENDED - Improves maintainability
**Action:**
- [ ] Create new file if not exists
- [ ] Define color constant objects:
  ```typescript
  export const roleColors = { ... }
  export const statusColors = { ... }
  export const dashboardIconColors = { ... }
  ```
- [ ] Update all files using colors to import from here
- [ ] Test all color mappings

**Benefit:** Single source of truth for semantic colors
**Complexity:** Low
**Risk:** Very Low (new file, no conflicts)

---

## Testing Checklist

After making updates, verify:

### Visual Testing
- [ ] All buttons display with correct colors
- [ ] Links are visible and correct color
- [ ] Status badges are legible
- [ ] Focus rings are visible
- [ ] Hover states work correctly

### Responsive Testing
- [ ] Mobile (320px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)
- [ ] All layouts adapt correctly

### Accessibility Testing
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states are visible
- [ ] Color not only distinguishing info
- [ ] Test with accessibility checker

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Functional Testing
- [ ] All buttons still work
- [ ] Forms still submit
- [ ] Navigation still functions
- [ ] No console errors

---

## Summary: Files to Update by Priority

### Critical (Do First)
1. ✓ `tailwind.config.ts` - Color palette
2. ✓ `src/app/globals.css` - Component styles

### High (Do Second)
3. ✓ `src/components/Navbar.tsx`
4. ✓ `src/app/(app)/dashboard/page.tsx`
5. ✓ `src/app/(app)/people/page.tsx`
6. ✓ `src/app/(app)/settings/users/page.tsx`

### Medium (Do Third)
7. ✓ `src/components/Toast.tsx`
8. ✓ `src/app/(app)/groups/page.tsx`
9. ✓ `src/app/(auth)/login/page.tsx`
10. ✓ `src/app/(auth)/register/page.tsx`

### Low (Do Last)
11. ✓ `src/app/(app)/services/page.tsx`
12. ✓ `src/app/(app)/layout.tsx`
13. ✓ `src/app/layout.tsx`
14. ✓ `src/app/(app)/settings/page.tsx`
15. ✓ Various detail/form pages

### Optional (Recommended)
16. ✓ `src/lib/colors.ts` - NEW utility file

---

## Estimated Effort

- **Phase 1 (Config):** 15-20 minutes
- **Phase 2 (Components):** 10-15 minutes
- **Phase 3 (Layouts):** 5-10 minutes
- **Phase 4 (Pages):** 30-45 minutes
- **Phase 5 (Auth):** 10-15 minutes
- **Testing:** 20-30 minutes
- **Optional (Utils):** 15-20 minutes

**Total Estimated Time:** 2-4 hours

---

## Notes for Implementation

1. **Start with foundation files** - tailwind.config.ts and globals.css
2. **Test frequently** - Run `npm run dev` after each phase
3. **Use search & replace** - Find `primary-600`, `text-gray-500`, etc. to identify all usage
4. **Extract colors early** - Create `lib/colors.ts` to avoid repetition
5. **Maintain accessibility** - Check contrast ratios with each color change
6. **Document decisions** - Keep notes on semantic color meanings
7. **Get design approval** - Confirm colors match brand guidelines before committing

---

**Total Files to Update:** ~18 files  
**Status:** Ready for brand guidelines implementation

