# Clearline Church Platform - File Reference Guide

## Directory Structure

```
clearline-church/
├── src/
│   ├── app/
│   │   ├── (app)/                          # Protected routes layout
│   │   │   ├── dashboard/page.tsx          ✓ Dashboard (partial)
│   │   │   ├── people/
│   │   │   │   ├── page.tsx                ✓ List people
│   │   │   │   ├── new/page.tsx            ✓ Add person form
│   │   │   │   └── import/page.tsx         ✓ CSV import
│   │   │   ├── services/
│   │   │   │   └── page.tsx                ✓ List services
│   │   │   ├── groups/
│   │   │   │   └── page.tsx                ✓ List groups
│   │   │   ├── settings/page.tsx           ✓ Organization settings
│   │   │   └── layout.tsx                  ✓ App layout with Navbar
│   │   │
│   │   ├── (auth)/                         # Auth routes layout
│   │   │   ├── login/page.tsx              ✓ Login form
│   │   │   └── register/page.tsx           ✓ Registration (bootstrap)
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts          ✓ Login endpoint
│   │   │   │   ├── register/route.ts       ✓ Registration endpoint
│   │   │   │   ├── logout/route.ts         ✓ Logout endpoint
│   │   │   │   └── me/route.ts             ✓ Current user endpoint
│   │   │   │
│   │   │   ├── people/
│   │   │   │   ├── route.ts                ✓ List & create people
│   │   │   │   ├── [id]/route.ts           ✓ Get, update, delete person
│   │   │   │   ├── import/route.ts         ✓ CSV import
│   │   │   │   └── export/route.ts         ✓ CSV export
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── route.ts                ✓ List & create services
│   │   │   │   ├── [id]/route.ts           ✓ Get, update, delete service
│   │   │   │   ├── [id]/items/route.ts     ✓ Create service items
│   │   │   │   └── [id]/assignments/route.ts  ✓ Create assignments
│   │   │   │
│   │   │   └── groups/
│   │   │       ├── route.ts                ✓ List & create groups
│   │   │       ├── [id]/route.ts           ✓ Get, update, delete group
│   │   │       ├── [id]/members/route.ts   ✓ Add group members
│   │   │       └── [id]/comments/route.ts  ✓ Add group comments
│   │   │
│   │   ├── layout.tsx                      ✓ Root layout
│   │   ├── page.tsx                        ✓ Home (redirects to dashboard)
│   │   └── globals.css                     ✓ Tailwind styles
│   │
│   ├── components/
│   │   └── Navbar.tsx                      ✓ Navigation component
│   │
│   ├── lib/
│   │   ├── auth.ts                         ✓ Auth utilities
│   │   ├── rbac.ts                         ✓ Permission system
│   │   ├── validation.ts                   ✓ Zod schemas
│   │   ├── prisma.ts                       ✓ Prisma client singleton
│   │   └── minio.ts                        ✓ MinIO client (not used)
│   │
│   └── middleware.ts                       ✓ Session middleware
│
├── prisma/
│   ├── schema.prisma                       ✓ Database schema (13 models)
│   └── migrations/
│
├── ARCHITECTURE.md                         ✓ Detailed architecture
├── CODEBASE_ASSESSMENT.md                  📄 Generated assessment (new)
├── QUICK_SUMMARY.md                        📄 Quick reference (new)
├── FILE_REFERENCE.md                       📄 This file (new)
└── README.md                               ✓ Setup instructions
```

## Key Files to Understand

### Authentication & Security
- **src/lib/auth.ts** - Session management, password hashing, rate limiting
- **src/lib/rbac.ts** - Permission model and org isolation
- **src/middleware.ts** - Route protection, session validation

### Database & Validation
- **prisma/schema.prisma** - Complete data model (13 models)
- **src/lib/validation.ts** - All Zod schemas for input validation

### API Routes
- **src/app/api/auth/** - Authentication endpoints
- **src/app/api/people/** - People management API
- **src/app/api/services/** - Service planning API
- **src/app/api/groups/** - Group management API

### Frontend Pages
- **src/app/(app)/dashboard/page.tsx** - Main dashboard
- **src/app/(app)/people/page.tsx** - People list (most complete)
- **src/app/(auth)/login/page.tsx** - Login page
- **src/components/Navbar.tsx** - Only component file

## Missing Files That Need to Be Created

### Detail/Edit Pages (CRITICAL)
```
src/app/(app)/
├── people/
│   ├── [id]/page.tsx                       ← MISSING: Person detail
│   └── [id]/edit/page.tsx                  ← MISSING: Person editor
├── services/
│   ├── new/page.tsx                        ← MISSING: Service creation
│   ├── [id]/page.tsx                       ← MISSING: Service detail
│   └── [id]/edit/page.tsx                  ← MISSING: Service editor
└── groups/
    ├── new/page.tsx                        ← MISSING: Group creation
    ├── [id]/page.tsx                       ← MISSING: Group detail
    └── [id]/edit/page.tsx                  ← MISSING: Group editor
```

### User Management (IMPORTANT)
```
src/app/(app)/
└── users/
    └── page.tsx                            ← MISSING: User list & management
```

### Invite System (IMPORTANT)
```
src/app/(auth)/
└── invite/
    └── [code]/page.tsx                     ← MISSING: Accept invite
```

### UI Components (RECOMMENDED)
```
src/components/
├── Modal.tsx                               ← MISSING: Reusable modal
├── Dropdown.tsx                            ← MISSING: Dropdown/select
├── Toast.tsx                               ← MISSING: Notifications
├── Confirm.tsx                             ← MISSING: Confirmation dialog
├── LoadingSpinner.tsx                      ← MISSING: Loading state
├── EmptyState.tsx                          ← MISSING: Empty state display
├── FormError.tsx                           ← MISSING: Form validation errors
└── PersonCard.tsx                          ← MISSING: Reusable person display
```

### API Endpoints (MINOR)
```
src/app/api/
├── services/[id]/items/[itemId]/route.ts   ← MISSING: Update/delete item
├── services/[id]/assignments/[id]/route.ts ← MISSING: Update/delete assignment
├── groups/[id]/members/[memberId]/route.ts ← MISSING: Remove member
├── groups/[id]/comments/[id]/route.ts      ← MISSING: Delete comment
└── users/                                   ← MISSING: User management
    ├── route.ts                            ← MISSING: List users
    ├── [id]/route.ts                       ← MISSING: Update/delete user
    └── invite/route.ts                     ← MISSING: Send invites
```

## Code Organization Principles

### Existing Patterns (Follow These)

1. **API Routes**
   - All in `src/app/api/`
   - Import `requireAuth()` and `requirePermission()`
   - Use `getOrgFilter()` for org isolation
   - Include audit logging for mutations
   - Return consistent error format

2. **Pages**
   - Use server components as default
   - Use 'use client' only when needed (forms, state)
   - Import from `@/` alias (absolute paths)
   - Use `next/link` for navigation

3. **Styling**
   - Tailwind CSS classes
   - Custom components in `src/app/globals.css`
   - Color scheme: primary (blue) with gray palette
   - Responsive: mobile-first

4. **Validation**
   - Zod schemas in `src/lib/validation.ts`
   - Add schema for every POST/PATCH endpoint
   - Validate both frontend and backend
   - Generic error messages for security

5. **Error Handling**
   - Try/catch blocks in API routes
   - Return appropriate status codes
   - Log errors to console
   - Generic error messages to client

## Database Schema Overview

### 13 Models
1. **Organization** - Tenant/org info
2. **User** - User accounts with roles
3. **Session** - User sessions
4. **Person** - Church directory
5. **Group** - Small groups/teams
6. **GroupMembership** - Group members
7. **GroupComment** - Group discussion
8. **ServicePlan** - Worship services
9. **ServiceItem** - Order of service elements
10. **ServiceAssignment** - People assigned to roles
11. **File** - Document/photo references
12. **AuditLog** - Change tracking
13. **Role Enum** - admin, leader, member, viewer

### Key Relationships
- Organization owns everything (cascade delete)
- Person can have many assignments and groups
- ServicePlan contains items and assignments
- Group has members and comments
- All entities tracked in AuditLog

## Styling Reference

### Color Palette
- **Primary**: Blue (50-900 shades)
- **Gray**: Gray palette for backgrounds/borders
- **Status**: Green (active), Red (danger)

### Reusable Classes
- `.btn` - Base button
- `.btn-primary` - Primary action
- `.btn-secondary` - Secondary action
- `.btn-danger` - Destructive action
- `.input` - Form input
- `.label` - Form label
- `.card` - Container/card

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=clearline-uploads
NODE_ENV=development
```

