# Liturgi Architecture Documentation

## Overview

Liturgi is a modern church management platform built with enterprise-grade architecture, focusing on scalability, security, and performance.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **State Management**: React Context + TanStack Query
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5
- **Authentication**: Session-based (HTTP-only cookies)
- **Password Hashing**: Argon2id

### Infrastructure
- **File Storage**: MinIO (S3-compatible)
- **Email**: Nodemailer with SMTP
- **Payments**: Stripe
- **Caching**: Redis (optional)
- **Search**: Elasticsearch/Typesense (optional)

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Grafana + Prometheus
- **Logging**: ELK Stack / Loki
- **Error Tracking**: Sentry

## Architecture Patterns

### Multi-Tenancy

Liturgi uses a **shared database, shared schema** multi-tenancy model with organization-level data isolation.

**Benefits**:
- Cost-effective for large number of tenants
- Easy to maintain and update
- Efficient resource utilization

**Implementation**:
- Every table has an `orgId` foreign key
- All queries are automatically scoped to the user's organization
- Row-level security through application logic
- Separate audit logs per organization

### Authentication & Authorization

**Session Management**:
- Session-based auth with HTTP-only, secure cookies
- 7-day session expiration (configurable)
- Automatic session cleanup via cron job
- Device tracking (IP, User-Agent, device name)

**RBAC (Role-Based Access Control)**:
- 4 built-in roles: Admin, Leader, Member, Viewer
- Custom role creation (coming soon)
- 18 granular permissions
- Module-level and field-level permissions

**Security Features**:
- Argon2id password hashing (64MB memory, 3 time cost)
- Rate limiting (in-memory for MVP, Redis for production)
- CSRF protection via SameSite cookies
- Optional 2FA (TOTP, SMS, Email)
- Email verification
- Password reset with time-limited tokens

### Database Design

**Schema Highlights**:
- 30+ tables covering all modules
- Optimized indexes for common queries
- JSON columns for flexible data (tags, settings, metadata)
- Audit logging for compliance
- Soft deletes with GDPR compliance (data retention periods)

**Key Models**:
- `Organization` - Tenant
- `User` - Organization members
- `Person` - Church members/contacts
- `ServicePlan` - Worship services
- `Group` - Small groups/teams
- `Song` - Music library
- `Subscription` - Billing
- `AuditLog` - Audit trail

### API Design

**REST API Principles**:
- Resource-based URLs
- HTTP verbs (GET, POST, PATCH, DELETE)
- JSON request/response bodies
- Consistent error responses
- Pagination for lists (limit/offset)
- Search and filtering via query params

**Endpoints**:
- `/api/auth/*` - Authentication
- `/api/user/*` - User management
- `/api/organization/*` - Org settings
- `/api/people/*` - People directory
- `/api/services/*` - Service planning
- `/api/groups/*` - Groups
- `/api/songs/*` - Music library
- `/api/billing/*` - Subscriptions
- `/api/webhooks/*` - Webhook management
- `/api/admin/*` - Super admin

**API Keys** (for integrations):
- HMAC-SHA256 authentication
- Scoped permissions
- Rate limiting per key
- Usage analytics

### File Management

**MinIO/S3 Storage**:
- Bucket per organization: `{orgId}/folder/filename`
- Pre-signed URLs for uploads (1-hour expiry)
- Pre-signed URLs for downloads (1-hour expiry)
- Automatic image optimization
- File type restrictions
- Storage quotas per plan

**Supported Files**:
- Images (profile photos, logos)
- Documents (service attachments, chord charts)
- Audio (song recordings)

### Email Infrastructure

**Architecture**:
- Asynchronous email queue
- Notification table as queue
- Background worker processes pending emails
- Template system with variable interpolation
- Organization-specific SMTP settings
- Bounce and unsubscribe handling

**Email Types**:
- Transactional (password reset, email verification)
- Notifications (assignment reminders, service updates)
- Bulk (announcements - future)

### Billing & Subscriptions

**Stripe Integration**:
- Customer creation linked to organization
- Subscription management (create, update, cancel)
- Webhook handling for payment events
- Invoice generation and storage
- Usage-based billing (optional)
- Proration for plan changes
- Dunning for failed payments

**Plans**:
- **Trial**: 14 days free, limited features
- **Basic**: $49/mo - Small churches
- **Pro**: $149/mo - Medium/large churches

### Search & Discovery

**Global Search** (Phase 2):
- Full-text search across all modules
- Elasticsearch/Typesense integration
- Search suggestions and autocomplete
- Saved searches
- Advanced filters

### Webhooks

**Outgoing Webhooks**:
- Event-driven architecture
- HMAC-SHA256 signature for verification
- Automatic retry with exponential backoff (3 attempts)
- Delivery logs and status tracking
- Configurable event subscriptions

**Supported Events**:
- `person.created`, `person.updated`, `person.deleted`
- `service.created`, `service.updated`
- `assignment.created`, `assignment.accepted`
- `user.created`, `user.invited`

### Audit & Compliance

**Audit Logging**:
- All CUD operations logged (Create, Update, Delete)
- Stores: user, entity, action, diff (before/after)
- Filterable by user, entity, date range
- Exportable for compliance
- Retention policy (7 years for audit logs)

**GDPR Compliance**:
- Data export (JSON format)
- Data deletion (right to be forgotten)
- 90-day data retention after deletion
- Email opt-out management
- Cookie consent

## Deployment Architecture

### Production Environment

```
                        ┌──────────────┐
                        │ CloudFlare   │
                        │ (CDN + DDoS) │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │ Load Balancer│
                        │ (Nginx)      │
                        └──────┬───────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
    │ Web Pod │          │ Web Pod │          │ Web Pod │
    │ (Next.js)│          │ (Next.js)│          │ (Next.js)│
    └────┬────┘          └────┬────┘          └────┬────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    ┌────▼────────┐      ┌────▼────────┐      ┌────▼────────┐
    │ PostgreSQL  │      │   MinIO     │      │   Redis     │
    │ (Primary)   │      │   (S3)      │      │  (Cache)    │
    └─────────────┘      └─────────────┘      └─────────────┘
         │
    ┌────▼────────┐
    │ PostgreSQL  │
    │ (Replica)   │
    └─────────────┘
```

### Scaling Strategy

**Horizontal Scaling**:
- Kubernetes HPA based on CPU/memory
- Min 3 pods, max 10 pods in production
- Stateless application (sessions in database)
- Load balancing with session affinity

**Database Scaling**:
- Read replicas for analytics and reports
- Connection pooling (PgBouncer)
- Query optimization and indexing
- Caching frequently accessed data (Redis)

**File Storage Scaling**:
- S3/MinIO scales automatically
- CDN for static assets (CloudFlare)
- Image optimization on upload

### Monitoring & Observability

**Metrics** (Prometheus + Grafana):
- Request rate, latency, error rate
- Database query performance
- Memory and CPU usage
- Active sessions
- API usage per organization

**Logging** (ELK Stack / Loki):
- Structured JSON logs
- Log levels: error, warn, info, debug
- Log aggregation across pods
- Search and filtering

**Error Tracking** (Sentry):
- Real-time error alerts
- Stack traces with source maps
- Error grouping and deduplication
- Performance monitoring

**Alerts**:
- PagerDuty for critical alerts
- Slack for warnings
- Email for daily summaries

### Security

**Network Security**:
- VPC with private subnets
- Security groups for pod-to-pod communication
- TLS/SSL everywhere (Let's Encrypt)
- DDoS protection (CloudFlare)

**Application Security**:
- OWASP Top 10 compliance
- XSS protection (sanitization)
- SQL injection protection (Prisma ORM)
- CSRF protection (SameSite cookies)
- Rate limiting per IP and endpoint
- Security headers (CSP, HSTS, X-Frame-Options)

**Data Security**:
- Encryption at rest (PostgreSQL TDE)
- Encryption in transit (TLS 1.3)
- Secrets management (Kubernetes Secrets / Vault)
- Regular security audits and penetration testing
- Dependency scanning (Dependabot, Snyk)

## Performance Optimization

**Frontend**:
- Code splitting and lazy loading
- Image optimization (Next.js Image)
- Static generation where possible
- Service workers for offline support (future)
- Lighthouse score > 95

**Backend**:
- Database query optimization
- N+1 query prevention
- Caching with Redis
- Background jobs for heavy operations
- API response compression (gzip)

**Target Metrics**:
- API response time: <100ms (p95)
- Page load time: <2 seconds
- Time to Interactive: <3 seconds
- Uptime: 99.9% SLA

## Development Workflow

### Local Development

```bash
# 1. Start services
docker-compose up -d postgres minio

# 2. Run migrations
cd app && npm run prisma:migrate

# 3. Seed database
npm run prisma:seed

# 4. Start dev server
npm run dev
```

### Git Workflow

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature branches
- **hotfix/***: Urgent fixes

### CI/CD Pipeline

1. **Lint**: ESLint + Prettier
2. **Type Check**: TypeScript compiler
3. **Test**: Jest (unit + integration)
4. **E2E**: Playwright
5. **Build**: Next.js production build
6. **Security Scan**: Trivy + npm audit
7. **Docker Build**: Multi-stage build
8. **Deploy**: Blue-Green deployment to K8s

## Future Enhancements

- **GraphQL API** (alternative to REST)
- **WebSockets** (real-time updates)
- **Mobile Apps** (React Native)
- **AI Features** (ChatGPT integration)
- **Advanced Analytics** (BI dashboard)
- **Multi-language Support** (i18n)
- **White-label** (custom domains and branding)
- **Marketplace** (third-party integrations)
