# Clearline Church Platform

A minimal-dependency SaaS MVP for churches that unifies People, Services, and Groups management. Built with Next.js, PostgreSQL, and MinIO.

## Features

### Core Modules

- **People (Directory)**: Manage church members with profiles, tags, notes, and CSV import/export
- **Services (Worship Planning)**: Create service plans with order of service, assignments, and volunteer scheduling
- **Groups (Small Groups/Teams)**: Organize groups with members, leaders, and discussion threads
- **Settings & Organization**: Manage org profile, plan limits, and user roles

### Authentication & Security

- Local email/password auth with Argon2id password hashing
- Secure session management with httpOnly cookies
- Role-based access control (Admin, Leader, Member, Viewer)
- Rate limiting on auth endpoints
- Tenant isolation (org-scoped queries)

### Storage

- Self-hosted MinIO (S3-compatible) for file uploads
- Pre-signed URLs for secure file access
- Support for profile photos and service attachments

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (REST)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Storage**: MinIO (S3-compatible)
- **Auth**: Custom implementation (Argon2id + sessions)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Git

### Quick Start with Docker Compose

1. Clone the repository:

\`\`\`bash
git clone <your-repo-url>
cd clearline-church
\`\`\`

2. Copy the environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

3. Generate a secure cookie secret:

\`\`\`bash
openssl rand -base64 32
\`\`\`

Update the `COOKIE_SECRET` in `.env` with the generated value.

4. Start all services:

\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- PostgreSQL on port 5432
- MinIO on port 9000 (API) and 9001 (Console)
- Next.js app on port 3000

5. Run database migrations:

\`\`\`bash
docker-compose exec web npm run prisma:migrate
\`\`\`

6. Seed the database with demo data:

\`\`\`bash
docker-compose exec web npm run prisma:seed
\`\`\`

7. Access the application:

- **App**: http://localhost:3000
- **MinIO Console**: http://localhost:9001

### Demo Credentials

After seeding, you can log in with:

- **Email**: admin@demo.church
- **Password**: Password123!

## Local Development (without Docker)

If you prefer to run the app locally without Docker:

1. Install dependencies:

\`\`\`bash
npm install
\`\`\`

2. Start PostgreSQL and MinIO locally (or update `.env` with your connection strings)

3. Set up the database:

\`\`\`bash
npm run prisma:migrate
npm run prisma:seed
\`\`\`

4. Start the dev server:

\`\`\`bash
npm run dev
\`\`\`

## Creating Your First Organization

### Bootstrap Admin Flow

The first user to register will automatically:
1. Create a new organization
2. Become the admin of that organization
3. Start a 30-day free trial

To create your organization:

1. Visit http://localhost:3000/register
2. Fill in:
   - Organization name (e.g., "First Baptist Church")
   - Subdomain (lowercase, alphanumeric, e.g., "firstbaptist")
   - Your admin account details
3. Click "Create organization"
4. You'll be automatically logged in

### Subsequent Users

After the first organization is created, new users require an invite code (feature to be implemented). For now, admins can create user accounts directly in the database or through future admin UI.

## MinIO Configuration

### Initial Bucket Setup

The `minio-init` service in Docker Compose automatically creates the `clearline-uploads` bucket on first run.

### Manual Bucket Creation

If you need to create buckets manually:

1. Access MinIO Console at http://localhost:9001
2. Login with credentials from `.env`:
   - Access Key: `clearline_admin`
   - Secret Key: `clearline_minio_secret`
3. Navigate to Buckets → Create Bucket
4. Create bucket named `clearline-uploads`

### File Organization

Files are organized by org and type:
- `{org-id}/people/` - Profile photos
- `{org-id}/services/` - Service attachments (chord charts, PDFs)
- `{org-id}/groups/` - Group files

## Database Schema

### Key Models

- **Organization**: Multi-tenant support (single-org per deployment in MVP)
- **User**: Email/password auth with role-based access
- **Person**: Church directory entries with tags and notes
- **Group**: Small groups with members and comments
- **ServicePlan**: Worship services with items and assignments
- **Session**: Secure session management
- **AuditLog**: Track all entity changes

### Migrations

Create a new migration:

\`\`\`bash
npm run prisma:migrate -- --name your_migration_name
\`\`\`

View database in Prisma Studio:

\`\`\`bash
npm run prisma:studio
\`\`\`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create org and admin (bootstrap)
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user

### People

- `GET /api/people` - List people (with filters)
- `POST /api/people` - Create person
- `GET /api/people/:id` - Get person details
- `PATCH /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person
- `POST /api/people/import` - Import from CSV
- `GET /api/people/export` - Export to CSV

### Services

- `GET /api/services` - List service plans
- `POST /api/services` - Create service plan
- `GET /api/services/:id` - Get service plan details
- `PATCH /api/services/:id` - Update service plan
- `DELETE /api/services/:id` - Delete service plan
- `POST /api/services/:id/items` - Add service item
- `POST /api/services/:id/assignments` - Assign person to role

### Groups

- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `PATCH /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member
- `POST /api/groups/:id/comments` - Add comment

## Role-Based Access Control

### Roles

- **Admin**: Full access to all modules and settings
- **Leader**: Manage people, services, and groups
- **Member**: View access + accept/decline assignments
- **Viewer**: Read-only access

### Permissions

Defined in `src/lib/rbac.ts`:

- `people:read`, `people:write`, `people:delete`
- `services:read`, `services:write`, `services:delete`
- `groups:read`, `groups:write`, `groups:delete`
- `settings:read`, `settings:write`
- `users:manage`, `org:manage`

## Plan Limits

Plans are configured in the organization's `planLimits` JSON field:

\`\`\`json
{
  "people": 100,
  "groups": 10,
  "servicePlans": 10
}
\`\`\`

### Plan Tiers (for reference)

- **Trial**: 30 days, 100 people, 10 groups, 10 service plans
- **Basic**: 100 people, 10 groups, 10 service plans
- **Pro**: 500 people, 50 groups, 50 service plans

Payment integration is deferred post-MVP.

## CSV Import/Export

### People CSV Format

\`\`\`csv
firstName,lastName,email,phone,tags,notes,status
John,Smith,john@example.com,555-0101,"[""Volunteer"",""Music""]","Great guitarist",active
\`\`\`

### Import

1. Navigate to People → Import CSV
2. Upload your CSV file
3. Review imported records

### Export

1. Navigate to People → Export CSV
2. Download the generated CSV file

## Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Rate Limiting

- Registration: 3 attempts per hour per IP
- Login: 5 attempts per 15 minutes per IP+email

### Session Management

- Sessions expire after 7 days
- HttpOnly, Secure cookies (in production)
- SameSite=Lax protection

### CSRF Protection

All state-changing requests are protected via SameSite cookie policy.

## Deployment Notes

### Environment Variables for Production

Ensure you set these in production:

\`\`\`bash
NODE_ENV=production
COOKIE_SECRET=<strong-random-secret>
DATABASE_URL=<production-db-url>
MINIO_ENDPOINT=<production-minio-endpoint>
MINIO_USE_SSL=true
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

### Docker Production Build

Update `docker-compose.yml` to use production settings and build the production image.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Ensure DATABASE_URL is correct in `.env`

### MinIO Connection Issues

- Verify MinIO is running: `docker-compose ps minio`
- Check logs: `docker-compose logs minio`
- Ensure bucket exists: Access MinIO Console

### Session/Auth Issues

- Clear cookies in browser
- Verify COOKIE_SECRET is set
- Check session expiry in database

### Migration Issues

Reset database (development only):

\`\`\`bash
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed
\`\`\`

## Project Structure

\`\`\`
clearline-church/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   ├── (app)/            # Protected app pages
│   │   └── api/              # API routes
│   ├── components/           # React components
│   └── lib/                  # Utilities
│       ├── prisma.ts         # Prisma client
│       ├── auth.ts           # Auth utilities
│       ├── rbac.ts           # Role-based access control
│       ├── minio.ts          # File storage utilities
│       └── validation.ts     # Zod schemas
├── docker-compose.yml        # Docker services
├── Dockerfile               # Production build
└── package.json
\`\`\`

## Roadmap

### Post-MVP Features

- [ ] Invite code system for new users
- [ ] Email notifications (SMTP integration)
- [ ] Password reset flow
- [ ] Calendar view for services and groups
- [ ] Drag-and-drop service item reordering
- [ ] Markdown support in notes
- [ ] In-app notification bell
- [ ] Payment integration (Stripe)
- [ ] Mobile-responsive enhancements
- [ ] Multi-org support per deployment
- [ ] Advanced reporting and analytics

## Contributing

This is an MVP project. Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ for churches everywhere.
