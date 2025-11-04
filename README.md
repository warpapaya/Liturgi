# Liturgi

> **The Modern Operating System for Church Services**
>
> Plan worship services, coordinate teams, and manage every detail of your church—all in one beautiful, purpose-built platform.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 📖 Overview

Liturgi is a comprehensive church management platform that unifies service planning, team coordination, and people management. Built with modern web technologies, it provides churches with a professional, self-hosted solution for organizing ministry operations.

### Project Structure

This monorepo contains two main components:

- **`/app`** - The main church management application (SaaS platform)
- **`/website`** - Marketing landing page and website

## ✨ Key Features

### 🎵 Service Planning
- Build complete orders of worship with intuitive workflows
- Template library for common service structures
- Song library with arrangements, keys, and notes
- Manage every element: songs, readings, announcements, transitions

### 👥 People Management
- Comprehensive church directory with profiles
- Tag and organize members by roles and teams
- Notes and history tracking
- CSV import/export for data migration

### 🤝 Groups & Teams
- Small groups and ministry team organization
- Member management and leadership assignment
- Discussion threads and group communication
- Schedule coordination

### 📅 Team Coordination
- Role assignments and volunteer scheduling
- Automatic conflict detection
- Assignment notifications (coming soon)
- Visual service roster management

### 🔐 Enterprise Security
- Role-based access control (Admin, Leader, Member, Viewer)
- Secure authentication with Argon2id password hashing
- Multi-tenant architecture with organization isolation
- Comprehensive audit logging
- Rate limiting and session management

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Node.js 20+** (for local development)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/warpapaya/Liturgi.git
   cd Liturgi/app
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Generate a secure cookie secret**
   ```bash
   openssl rand -base64 32
   ```
   Update `COOKIE_SECRET` in `.env` with the generated value.

4. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL (port 5432)
   - MinIO object storage (ports 9000, 9001)
   - Next.js application (port 3000)

5. **Run database migrations**
   ```bash
   docker-compose exec web npm run prisma:migrate
   docker-compose exec web npm run prisma:seed
   ```

6. **Access the application**
   - **App**: http://localhost:3000
   - **MinIO Console**: http://localhost:9001

### Demo Credentials

After seeding, log in with:
- **Email**: `admin@demo.church`
- **Password**: `Password123!`

## 🏗️ Technology Stack

### Application (`/app`)

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes (REST) |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Storage** | MinIO (S3-compatible object storage) |
| **Authentication** | Custom (Argon2id + secure sessions) |
| **Validation** | Zod schemas |

### Website (`/website`)

| Category | Technologies |
|----------|-------------|
| **Frontend** | React, TypeScript, Tailwind CSS |
| **Build** | Vite |
| **Routing** | Wouter |
| **UI Components** | Shadcn/ui |

## 📁 Repository Structure

```
liturgi/
├── app/                          # Main application
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Database seeding
│   │   └── migrations/          # Migration history
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Authentication pages
│   │   │   ├── (app)/          # Protected application pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── people/
│   │   │   │   ├── services/
│   │   │   │   ├── groups/
│   │   │   │   └── settings/
│   │   │   └── api/            # REST API endpoints
│   │   ├── components/         # React components
│   │   └── lib/                # Core utilities
│   │       ├── auth.ts         # Authentication
│   │       ├── rbac.ts         # Access control
│   │       ├── prisma.ts       # Database client
│   │       ├── minio.ts        # File storage
│   │       └── validation.ts   # Input validation
│   ├── docker-compose.yml      # Docker orchestration
│   ├── Dockerfile             # Production container
│   └── package.json
│
└── website/                     # Marketing website
    └── liturgi-landing/
        ├── client/
        │   └── src/
        │       ├── components/
        │       ├── pages/
        │       └── App.tsx
        ├── server/
        └── package.json
```

## 🔧 Development

### Local Development (without Docker)

1. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

2. **Start PostgreSQL and MinIO** (or update connection strings in `.env`)

3. **Set up database**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed database with demo data |
| `npm run prisma:studio` | Open Prisma Studio (DB GUI) |
| `npm run lint` | Run ESLint |

## 🔐 Security Features

- **Password Requirements**: 8+ characters, uppercase, lowercase, number
- **Rate Limiting**:
  - Registration: 3 attempts/hour per IP
  - Login: 5 attempts/15 min per IP+email
- **Session Security**:
  - 7-day expiration
  - HttpOnly, Secure cookies (production)
  - SameSite=Lax CSRF protection
- **Tenant Isolation**: All queries scoped to organization
- **Audit Logging**: Complete change tracking

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Create organization and admin
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - End session
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
- `GET /api/services/:id` - Get details
- `PATCH /api/services/:id` - Update plan
- `DELETE /api/services/:id` - Delete plan
- `POST /api/services/:id/items` - Add service item
- `POST /api/services/:id/assignments` - Assign volunteer

### Groups
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get details
- `PATCH /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member
- `POST /api/groups/:id/comments` - Add comment

## 👥 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all modules and settings |
| **Leader** | Manage people, services, and groups |
| **Member** | View access + accept/decline assignments |
| **Viewer** | Read-only access |

Permissions are granular and defined in `src/lib/rbac.ts`:
- `people:*`, `services:*`, `groups:*`
- `settings:*`, `users:manage`, `org:manage`

## 📊 Project Status

### Current Progress: ~40-50% Complete

#### ✅ What's Working
- Authentication & authorization
- People management (add, import, list)
- Service plan creation
- Group creation
- CSV import/export
- Organization settings
- Audit logging

#### 🚧 In Progress
- Service detail pages and editor
- Person profile pages
- Group detail pages
- Assignment workflow UI
- User invitation system
- File upload integration

#### 📋 Roadmap

**Phase 1: MVP Completion** (100-150 hours)
- [ ] Service detail/editor pages
- [ ] Person detail/editor pages
- [ ] Group detail/editor pages
- [ ] User invitation system
- [ ] UI component library (modals, dropdowns, date pickers)
- [ ] Assignment workflow
- [ ] Toast notifications and confirmations

**Phase 2: Post-MVP**
- [ ] Email notifications (SMTP)
- [ ] Password reset flow
- [ ] Calendar views
- [ ] Drag-and-drop reordering
- [ ] Markdown support
- [ ] In-app notifications
- [ ] Payment integration (Stripe)
- [ ] Mobile responsive enhancements
- [ ] Advanced reporting

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
COOKIE_SECRET=<strong-random-secret>
DATABASE_URL=<production-db-url>
MINIO_ENDPOINT=<production-minio-endpoint>
MINIO_USE_SSL=true
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Building for Production

```bash
npm run build
npm start
```

### Docker Production Build

Update `docker-compose.yml` for production settings and build:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Database Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Reset database (development only)
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
npm run prisma:seed
```

### MinIO Issues
```bash
# Check MinIO status
docker-compose ps minio

# Access console
# http://localhost:9001
# Username: clearline_admin
# Password: clearline_minio_secret
```

### Session/Auth Issues
- Clear browser cookies
- Verify `COOKIE_SECRET` is set
- Check session expiry in database

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow existing code style and conventions
- Write TypeScript with proper types
- Use Zod for validation schemas
- Include comments for complex logic
- Test API endpoints thoroughly
- Ensure responsive design for UI changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for churches everywhere by people who understand ministry.

Special thanks to:
- The Next.js team for an amazing framework
- Prisma for excellent database tooling
- The open-source community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/warpapaya/Liturgi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/warpapaya/Liturgi/discussions)
- **Email**: [Your support email]

---

**Plan. Serve. Worship. Together.**
