# Clearline Church Platform - Architecture

## Overview

This is a minimal-dependency, single-tenant SaaS MVP built for church management. The architecture prioritizes simplicity, security, and self-hosting.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│                    (Next.js App - React)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     Next.js Server                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              App Router Pages                       │   │
│  │  (Auth, Dashboard, People, Services, Groups)        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes (REST)                      │   │
│  │  /api/auth/*  /api/people/*  /api/services/*        │   │
│  │  /api/groups/*                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Business Logic Layer                      │   │
│  │  • Auth (Argon2id, Sessions)                        │   │
│  │  • RBAC (Role-based access control)                 │   │
│  │  • Validation (Zod schemas)                         │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────────┬───────────────────┘
             │                          │
             │                          │
   ┌─────────▼────────┐      ┌─────────▼──────────┐
   │   PostgreSQL     │      │      MinIO         │
   │    Database      │      │  (S3-compatible)   │
   │   (Prisma ORM)   │      │   File Storage     │
   └──────────────────┘      └────────────────────┘
```

## Core Principles

### 1. Minimal Dependencies

- **No external auth providers** (Auth0, Clerk, Supabase)
- **No external email services** (SendGrid, Mailgun) - deferred
- **No external storage** (AWS S3) - using self-hosted MinIO
- **No external job queues** - synchronous operations in MVP

### 2. Security First

- **Argon2id** password hashing with secure parameters
- **HttpOnly cookies** for session management
- **Rate limiting** on authentication endpoints
- **RBAC** for fine-grained access control
- **Tenant isolation** via org-scoped queries
- **CSRF protection** via SameSite cookies

### 3. Single-Tenant by Design

Each deployment serves one organization. Multi-tenant capability exists in the schema but is not exposed in MVP.

## Technology Stack

### Frontend

- **Next.js 14** (App Router)
  - Server Components for initial page loads
  - Client Components for interactive features
- **React 18**
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Backend

- **Next.js API Routes** (serverless-style handlers)
- **Prisma ORM** for type-safe database access
- **Zod** for runtime validation

### Database

- **PostgreSQL 16** with:
  - JSON columns for flexible data (tags, attachments)
  - Full-text search capabilities (future)
  - Row-level security ready (future)

### Storage

- **MinIO** (S3-compatible object storage)
  - Pre-signed URLs for secure access
  - Organized by org and module

### Infrastructure

- **Docker Compose** for local development
- **Docker** for production deployment

## Data Model

### Entity Relationships

```
Organization (1) ──┬── (N) User
                   ├── (N) Person
                   ├── (N) Group
                   ├── (N) ServicePlan
                   ├── (N) File
                   └── (N) AuditLog

Person (1) ──┬── (N) GroupMembership
             └── (N) ServiceAssignment

Group (1) ──┬── (N) GroupMembership
            └── (N) GroupComment

ServicePlan (1) ──┬── (N) ServiceItem
                  └── (N) ServiceAssignment

User (1) ── (N) Session
User (1) ── (N) AuditLog
```

### Key Design Decisions

1. **JSON for flexible data**: Tags and attachments use JSON columns to avoid complex joins
2. **Soft deletes avoided**: Hard deletes with audit logging for compliance
3. **Position field**: Integer position for service item ordering (simpler than linked list)
4. **Status enums**: Type-safe status fields prevent invalid states

## Authentication Flow

### Registration (Bootstrap Admin)

```
1. User visits /register
2. Form validates (client + server)
3. Check: Is this first org? (count orgs)
4. If yes:
   a. Create Organization (trial plan, 30 days)
   b. Create User (admin role, hashed password)
   c. Create Session (7-day expiry)
   d. Set httpOnly cookie
   e. Redirect to /dashboard
5. If no:
   a. Require invite code (not implemented in MVP)
```

### Login

```
1. User visits /login
2. Form submits email + password
3. Rate limit check (5 attempts per 15 min)
4. Find user by email
5. Verify password with Argon2
6. Create session (7-day expiry)
7. Set httpOnly cookie
8. Update lastLoginAt
9. Redirect to /dashboard
```

### Session Validation

```
1. Middleware checks for session cookie
2. If missing → redirect to /login
3. If present → validate in database
4. Check expiry
5. Load user + org data
6. Attach to request context
```

## RBAC Model

### Roles

- **Admin**: Full control over org
- **Leader**: Manage people, services, groups
- **Member**: View + accept/decline assignments
- **Viewer**: Read-only access

### Permission Checks

```typescript
// In API route
const user = await requireAuth() // Throws if not authenticated
requirePermission(user, 'people:write') // Throws if lacking permission

// In UI
if (hasPermission(user, 'services:write')) {
  // Show edit button
}
```

### Org Isolation

Every query includes `orgId` filter:

```typescript
const people = await prisma.person.findMany({
  where: {
    ...getOrgFilter(user), // { orgId: user.orgId }
    status: 'active',
  },
})
```

## File Storage

### MinIO Organization

```
clearline-uploads/
├── {org-id}/
│   ├── people/
│   │   └── {timestamp}-{filename}
│   ├── services/
│   │   └── {timestamp}-{filename}
│   └── groups/
│       └── {timestamp}-{filename}
```

### Upload Flow

```
1. Client requests upload URL
2. Server generates pre-signed PUT URL (1 hour expiry)
3. Client uploads directly to MinIO
4. Client notifies server of completion
5. Server creates File record in database
```

### Download Flow

```
1. Client requests file
2. Server verifies ownership/permission
3. Server generates pre-signed GET URL (1 hour expiry)
4. Server returns URL to client
5. Client fetches from MinIO
```

## API Design

### REST Conventions

- `GET /api/resource` - List
- `POST /api/resource` - Create
- `GET /api/resource/:id` - Read
- `PATCH /api/resource/:id` - Update
- `DELETE /api/resource/:id` - Delete

### Response Format

```json
// Success
{
  "resource": { ... },
  "resources": [ ... ]
}

// Error
{
  "error": "Human-readable message",
  "details": { ... } // Optional, for validation errors
}
```

### Validation Pipeline

```
1. Parse request body
2. Zod schema validation
3. Check authentication
4. Check permissions
5. Check plan limits (if creating)
6. Execute business logic
7. Create audit log entry
8. Return response
```

## Scaling Considerations

### Current Limits (MVP)

- Single Next.js server process
- Synchronous API calls (no background jobs)
- In-memory rate limiting (resets on restart)
- Single PostgreSQL instance
- Single MinIO instance

### Future Optimizations

1. **Horizontal scaling**
   - Multiple Next.js server instances
   - Redis for rate limiting + sessions
   - Load balancer

2. **Background jobs**
   - BullMQ or similar for async tasks
   - Email sending, exports, imports

3. **Caching**
   - Redis for frequently accessed data
   - CDN for static assets

4. **Database**
   - Read replicas for reporting
   - Connection pooling (PgBouncer)

5. **Storage**
   - MinIO in distributed mode
   - CDN for user-uploaded files

## Deployment Strategy

### Development

```bash
docker-compose up -d
# All services start locally
# Hot reload enabled
```

### Production (Docker)

```bash
docker-compose -f docker-compose.prod.yml up -d
# Uses built Next.js standalone output
# Optimized images
# Health checks
# Resource limits
```

### Production (Non-Docker)

```bash
# Build
npm run build

# Migrate
npm run prisma:migrate

# Start
npm start
```

## Monitoring & Observability

### Audit Logging

All entity changes logged:

```typescript
{
  orgId: "...",
  userId: "...",
  action: "created" | "updated" | "deleted",
  entity: "Person" | "ServicePlan" | ...,
  entityId: "...",
  diff: { old: {...}, new: {...} }
}
```

### Error Handling

- API routes catch all errors
- Return appropriate status codes
- Log errors to console (future: external service)

## Security Checklist

- [x] Passwords hashed with Argon2id
- [x] Sessions in database, httpOnly cookies
- [x] Rate limiting on auth endpoints
- [x] Input validation (Zod)
- [x] SQL injection protected (Prisma ORM)
- [x] XSS protected (React escaping)
- [x] CSRF protected (SameSite cookies)
- [x] Tenant isolation (org-scoped queries)
- [ ] HTTPS enforced (production)
- [ ] Security headers (helmet.js)
- [ ] Dependency scanning
- [ ] Penetration testing

## Performance Considerations

### Database Indexes

Key indexes created:
- `users(orgId, email)` - Unique compound for fast auth lookup
- `people(orgId, status)` - Fast filtered queries
- `servicePlans(orgId, date)` - Calendar views
- `sessions(expiresAt)` - Cleanup expired sessions

### N+1 Query Prevention

Use Prisma `include` to eager-load relationships:

```typescript
const servicePlan = await prisma.servicePlan.findUnique({
  where: { id },
  include: {
    items: true,
    assignments: { include: { person: true } }
  }
})
```

### Bundle Size

- Tree-shaking enabled
- Code splitting via Next.js dynamic imports
- Minimal dependencies

## Future Architecture Considerations

### Multi-Tenancy

To enable multiple orgs per deployment:

1. Add subdomain routing in middleware
2. Update session to include orgId lookup
3. Add org-switching UI for users in multiple orgs
4. Implement cross-org permission model

### Real-Time Features

For live updates (service plan collaboration):

1. Add WebSocket support (Socket.io)
2. Implement optimistic UI updates
3. Conflict resolution for concurrent edits

### Mobile Apps

API is ready for mobile consumption:

1. Same REST endpoints
2. OAuth2 tokens instead of cookies
3. Offline-first with sync

---

**Last Updated**: 2025-01-03
