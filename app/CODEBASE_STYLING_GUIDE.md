# Clearline Church Platform - Styling & UI Organization Overview

## Executive Summary

The Clearline Church Platform is a **Next.js 14** application with **React 18** and **Tailwind CSS**. It follows a modern component-based architecture with minimal external dependencies. The project uses a single-tenant SaaS model with role-based access control (RBAC).

---

## 1. Project Structure

```
/Users/petie/Documents/clearline-church/
├── src/
│   ├── app/
│   │   ├── (app)/                    # Protected routes (app layout)
│   │   │   ├── dashboard/
│   │   │   ├── people/
│   │   │   ├── services/
│   │   │   ├── groups/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── (auth)/                   # Auth routes (login/register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/                      # REST API routes
│   │   ├── globals.css               # Global Tailwind + Component layer styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page (redirects to /dashboard)
│   ├── components/                   # Reusable UI components
│   │   ├── Navbar.tsx
│   │   └── Toast.tsx
│   ├── lib/                          # Utilities & helpers
│   │   ├── auth.ts
│   │   ├── minio.ts
│   │   ├── prisma.ts
│   │   ├── rbac.ts
│   │   └── validation.ts
│   └── middleware.ts                 # Auth middleware
├── package.json
├── tailwind.config.ts                # Tailwind configuration
├── postcss.config.js                 # PostCSS configuration
├── tsconfig.json                     # TypeScript configuration
└── next.config.js                    # Next.js configuration
```

---

## 2. Framework & Dependencies

### Core Technologies
- **Next.js 14** (App Router)
- **React 18** (with TypeScript)
- **Tailwind CSS 3.4**
- **TypeScript 5**

### UI/Styling Stack
- **Tailwind CSS** for utility-first styling
- **PostCSS** + **Autoprefixer** for CSS processing
- **Next.js Google Fonts** (Inter) for typography
- **Inline Tailwind classes** for component styling

### Additional Libraries
- **Prisma ORM** - Database access
- **Zod** - Runtime validation
- **date-fns** - Date formatting
- **clsx** - Utility for conditional CSS classes
- **React DnD** - Drag and drop functionality
- **Argon2** - Password hashing
- **MinIO** - S3-compatible file storage

---

## 3. Styling & Theming Configuration

### 3.1 Tailwind Configuration
**File:** `/Users/petie/Documents/clearline-church/tailwind.config.ts`

```typescript
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

**Current Color System:**
- **Primary Color**: Sky blue (extends Tailwind defaults)
  - Palette ranges from 50 (lightest) to 900 (darkest)
  - Uses for primary actions, links, focus states
- **Secondary Colors**: Tailwind defaults (gray, red, green, blue, purple, orange, yellow)

### 3.2 Global CSS & Component Layer
**File:** `/Users/petie/Documents/clearline-church/src/app/globals.css`

Uses Tailwind's `@layer` directive to define reusable component classes:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
  }
  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  .card {
    @apply bg-white rounded-lg shadow-sm p-6;
  }
}
```

**Current Component Classes:**
- `.btn` - Base button styles
- `.btn-primary` - Primary action button (blue)
- `.btn-secondary` - Secondary action button (gray)
- `.btn-danger` - Destructive action button (red)
- `.input` - Form input styling
- `.label` - Form label styling
- `.card` - Card container (white bg, shadow, padding)

### 3.3 Typography Configuration
**Font:** Inter (Google Fonts)
- **Location:** `/src/app/layout.tsx`
- **Applied:** `<body className={inter.className}>`
- **Single Font Stack**: Only Inter is configured
- **No custom font sizes/weights defined** - Uses Tailwind defaults

---

## 4. Component Structure

### 4.1 Reusable Components
**Location:** `/Users/petie/Documents/clearline-church/src/components/`

#### Navbar.tsx
- Authenticated user navigation bar
- Displays organization name and user info
- Navigation links: Dashboard, People, Services, Groups, Settings
- Logout button
- Uses Tailwind for styling inline

#### Toast.tsx
- Global toast notification system
- Types: success, error, info
- Auto-dismisses after 4 seconds
- Positioned fixed (top-right)
- Uses icons and color-coded styling

### 4.2 Layout Components
Located in `/src/app/`

#### Root Layout (`layout.tsx`)
- Wraps entire app
- Loads Inter font
- Sets page metadata

#### App Layout (`(app)/layout.tsx`)
- Protects authenticated routes
- Contains Navbar and ToastContainer
- Main content area with max-width constraint
- Uses `bg-gray-50` background

#### Auth Layouts (`(auth)/`)
- Simpler layout for login/register
- Centered form design
- No navbar

### 4.3 Page-Level Components
Styling is primarily done via **inline Tailwind classes** in page components:

**Common Patterns:**
- `.space-y-6` - Vertical spacing between sections
- `.grid` with responsive breakpoints (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- `.card` for content containers
- `.btn-primary`, `.btn-secondary` for actions
- `.input`, `.label` for forms
- Inline badge styling for status (green, gray, purple, blue, orange)

---

## 5. Existing Color Variables & Theme System

### 5.1 Primary Colors Currently Used
- **Primary (Sky Blue)**: `primary-50` through `primary-900`
  - Links: `text-primary-600`, `hover:text-primary-500`
  - Backgrounds: `bg-primary-50`, `bg-primary-600`
  - Borders: `border-primary-300`, `border-primary-500`

### 5.2 Semantic Colors (Tailwind Defaults)
- **Success/Active**: Green (`bg-green-100 text-green-800`, `text-green-600`)
- **Danger/Error**: Red (`bg-red-50 border-red-200`, `text-red-600`)
- **Info**: Blue (`bg-blue-50 border-blue-500`, `text-blue-800`)
- **Warning**: Yellow (`bg-yellow-50 border-yellow-200`)
- **Neutral/Inactive**: Gray (all shades: 50-900)

### 5.3 Status Badge Colors
**From `/src/app/(app)/settings/users/page.tsx`:**
```typescript
const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800'
    case 'leader': return 'bg-blue-100 text-blue-800'
    case 'member': return 'bg-green-100 text-green-800'
    case 'viewer': return 'bg-gray-100 text-gray-800'
  }
}
```

**From people status badges:**
```typescript
person.status === 'active'
  ? 'bg-green-100 text-green-800'
  : 'bg-gray-100 text-gray-800'
```

### 5.4 Dashboard Icon Colors
- People: Blue (`text-blue-600`, `bg-blue-100`)
- Groups: Green (`text-green-600`, `bg-green-100`)
- Services: Purple (`text-purple-600`, `bg-purple-100`)
- Users: Orange (`text-orange-600`, `bg-orange-100`)

### 5.5 Interactive States
- **Hover**: Slightly darker primary color or background shift
- **Focus**: Ring with `focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`
- **Active/Current**: Solid color with border-bottom in nav
- **Disabled**: Lower opacity or gray color

---

## 6. Copy/Text Content Location

### 6.1 Hard-Coded Content
- **In Components**: Most text is hard-coded directly in JSX
- **Page Headers**: Titles like "People", "Services", "Groups" are in page components
- **Button Labels**: "Add Person", "Create Service", "Sign in to Clearline", etc.
- **Placeholder Text**: "Search people...", "No people found.", etc.

### 6.2 Dynamic Content
- **User Data**: Fetched from API endpoints (`/api/auth/me`, `/api/people`, etc.)
- **Timestamps**: Formatted using `date-fns` library
- **Status Labels**: Generated from database values (e.g., "active", "admin")

### 6.3 No i18n/Localization Currently
- No i18n files detected
- All content is English-only
- No translation system in place

### 6.4 Common Text Patterns Found
**Greeting Messages:**
```typescript
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
```

**Empty States:**
- "No people found."
- "No services found."
- "No groups found."
- "Loading..."

**Navigation Labels:**
```typescript
const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/people', label: 'People' },
  { href: '/services', label: 'Services' },
  { href: '/groups', label: 'Groups' },
  { href: '/settings', label: 'Settings' },
]
```

---

## 7. Type Safety & Validation

### 7.1 TypeScript Configuration
**File:** `/Users/petie/Documents/clearline-church/tsconfig.json`
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` points to `./src/*`

### 7.2 Type Definitions
- All components use TypeScript interfaces
- Zod schemas for runtime validation (`/src/lib/validation.ts`)
- Database types generated by Prisma

---

## 8. File Organization Summary

### Styling Files
- **Main**: `/src/app/globals.css` (component layer definitions)
- **Config**: `/tailwind.config.ts`
- **PostCSS**: `/postcss.config.js`

### Component Files
- `/src/components/Navbar.tsx` - Main navigation
- `/src/components/Toast.tsx` - Toast notifications

### Page Files (with inline Tailwind)
- `/src/app/(app)/dashboard/page.tsx`
- `/src/app/(app)/people/page.tsx`
- `/src/app/(app)/services/page.tsx`
- `/src/app/(app)/groups/page.tsx`
- `/src/app/(app)/settings/page.tsx`
- `/src/app/(app)/settings/users/page.tsx`
- `/src/app/(auth)/login/page.tsx`
- `/src/app/(auth)/register/page.tsx`

---

## 9. Current Design System Summary

### Colors
- **Primary**: Sky Blue (`#0ea5e9` at 500)
- **Semantic**: Green (success), Red (danger), Blue (info), Yellow (warning), Gray (neutral)
- **Backgrounds**: Light gray (`bg-gray-50`), White (`bg-white`)
- **Text**: Dark gray (`text-gray-900`), Medium gray (`text-gray-500`), Light gray (`text-gray-600`)

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Tailwind defaults (`text-sm`, `text-base`, `text-lg`, `text-3xl`, etc.)
- **Weights**: Tailwind defaults (medium, semibold, bold)
- **Line Height**: Tailwind defaults

### Spacing
- Tailwind spacing scale (0.25rem increments)
- Common: `px-4 py-2`, `p-6`, `space-y-6`, `gap-6`

### Borders & Shadows
- Border radius: `rounded-lg` (most common)
- Shadows: `shadow-sm` (cards), `shadow-md`, `shadow-lg`
- Borders: `border border-gray-200`, `border-l-4` (toast)

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:` prefixes
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 10. Key Files for Brand Updates

### Priority Files to Update
1. **`/tailwind.config.ts`** - Color palette definitions
2. **`/src/app/globals.css`** - Component class definitions
3. **`/src/components/Navbar.tsx`** - Brand colors in navigation
4. **`/src/app/(app)/layout.tsx`** - Main app background/layout
5. **All page components** in `/src/app/(app)/` - Inline color classes
6. **Status/badge colors** - Throughout pages (3 locations found)

### Files with No Styling to Update
- All API route files (`/src/app/api/`)
- Utility functions (`/src/lib/`)
- Configuration files (except tailwind.config.ts)

---

## 11. Styling Best Practices Currently Used

1. **Utility-First**: Heavy use of Tailwind utility classes
2. **Component Classes**: Some repeated patterns in `globals.css` (buttons, inputs, cards)
3. **Inline Styling**: Most page-specific styling inline in JSX
4. **Responsive**: Mobile-first with `md:` and `lg:` breakpoints
5. **Consistency**: Color system uses primary/semantic colors
6. **Accessibility**: Focus states with ring, proper contrast

---

## 12. Recommendations for Brand Update

### Short-term Actions
1. Create comprehensive color palette in `tailwind.config.ts`
2. Update `.btn-*` and other component classes in `globals.css`
3. Replace hard-coded color references in components
4. Create utility constants for badge/status colors

### Long-term Improvements
1. Consider extracting inline styles to CSS modules or Tailwind classes
2. Create a `colors.ts` utility file for color mappings
3. Consider adding design tokens documentation
4. Implement CSS variables for dynamic theming (future)
5. Add i18n setup for copy management

---

## Summary Statistics

- **Total TypeScript/TSX Files**: ~45 files
- **Total Lines of Code**: ~6,269 lines
- **Reusable Components**: 2 (Navbar, Toast)
- **Pages**: 8 main pages + API routes
- **Color Variables Defined**: 1 primary palette (9 shades)
- **Component Classes**: 7 main classes (.btn, .btn-primary, .btn-secondary, .btn-danger, .input, .label, .card)
- **Hard-coded Color References**: 15+ locations across components and pages
