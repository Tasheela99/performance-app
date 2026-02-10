# Performance Management System

A comprehensive employee performance appraisal and management system built with Next.js, PostgreSQL, and Prisma ORM. Features role-based access control, template management, goal tracking, and performance reviews.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [User Roles & Permissions](#-user-roles--permissions)
- [Default Credentials](#-default-credentials)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

## ✨ Features

### Authentication & Authorization
- ✅ JWT-based authentication with secure token management
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ User registration with email validation
- ✅ Password reset via email (SMTP integration)
- ✅ Protected routes and API endpoints
- ✅ Persistent sessions with localStorage

### Appraisal Management
- ✅ **Admin/Manager Features:**
  - Create and manage appraisal templates
  - Define performance goals with categories and weightage
  - Assign templates to specific employees
  - Review and score employee submissions
  - Track submission status and deadlines
  - View dashboard analytics and charts

- ✅ **Employee Features:**
  - View assigned appraisals
  - Fill out self-assessments
  - Save drafts and submit when ready
  - Track submission status
  - View review scores and feedback

### User Management (Admin Only)
- ✅ List all users in the system
- ✅ Change user roles (Admin/Manager/Employee)
- ✅ View user details and statistics
- ✅ Prevent self-demotion for security

### Dashboard & Analytics
- ✅ Real-time performance statistics
- ✅ Interactive charts (Recharts)
- ✅ Submission status tracking
- ✅ Upcoming deadlines and notifications
- ✅ Recent activity feeds

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router)
- **UI:** React 19.2.3
- **Styling:** Tailwind CSS 4
- **Icons:** FontAwesome
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js 18+
- **API:** Next.js API Routes
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt

### Database
- **Database:** PostgreSQL
- **ORM:** Prisma 6.19.2
- **Migrations:** Prisma Migrate
- **Type Safety:** Prisma Client

### Development Tools
- **TypeScript:** 5.x
- **Linting:** ESLint
- **Package Manager:** npm

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (v13 or higher)
   - **Windows:** https://www.postgresql.org/download/windows/
   - **macOS:** `brew install postgresql@15`
   - **Linux:** `sudo apt install postgresql postgresql-contrib`
   - Verify: `psql --version`

3. **Git** (for version control)
   - Download: https://git-scm.com/
   - Verify: `git --version`

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd performance-management-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Prisma ORM
- Authentication libraries (bcrypt, jsonwebtoken)
- UI libraries (Tailwind CSS, FontAwesome, Recharts)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your configuration (see [Environment Variables](#-environment-variables) section).

### 4. Set Up PostgreSQL Database

**Start PostgreSQL service:**

```bash
# Windows (PowerShell as Administrator)
net start postgresql-x64-15

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

**Create the database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE performance_management;

# Exit
\q
```

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 6. Seed Initial Data

```bash
npm run db:seed
```

This creates a default admin user with credentials:
- **Email:** admin@performance-management.com
- **Password:** Admin@123456

⚠️ **Change this password after first login!**

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# ────────────────────────────────────────────────────────────
# DATABASE CONFIGURATION (Required)
# ────────────────────────────────────────────────────────────
# PostgreSQL connection string
# Format: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/performance_management"

# ────────────────────────────────────────────────────────────
# AUTHENTICATION (Required)
# ────────────────────────────────────────────────────────────
# Secret key for JWT token signing (use a strong random string)
# Generate one: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-change-in-production-use-strong-key"

# ────────────────────────────────────────────────────────────
# API CONFIGURATION (Required)
# ────────────────────────────────────────────────────────────
# Base URL for API calls (use your domain in production)
NEXT_PUBLIC_API_URL="http://localhost:3000"

# ────────────────────────────────────────────────────────────
# EMAIL CONFIGURATION (Optional - for password reset)
# ────────────────────────────────────────────────────────────
# SMTP server settings (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"  # Not your Gmail password!
SMTP_FROM="noreply@performancemanagement.com"

# ────────────────────────────────────────────────────────────
# NOTES
# ────────────────────────────────────────────────────────────
# 1. Never commit .env.local to version control
# 2. For Gmail, use App Passwords: https://myaccount.google.com/apppasswords
# 3. Generate strong JWT_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# 4. In production, use environment-specific values
```

### Email Configuration (Optional)

For password reset functionality, you need SMTP credentials:

**Gmail Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your Gmail password) in `SMTP_PASSWORD`

**Other SMTP Providers:**
- **SendGrid:** smtp.sendgrid.net (Port: 587)
- **AWS SES:** email-smtp.region.amazonaws.com (Port: 587)
- **Mailgun:** smtp.mailgun.org (Port: 587)

## 🗄 Database Setup

### PostgreSQL Installation

**Windows:**
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer and follow wizard
3. Remember the password for `postgres` user
4. Default port: 5432

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Database Creation

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE performance_management;

# Verify database
\l

# Connect to the database
\c performance_management

# Exit
\q
```

### Prisma Commands

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generate Prisma Client from schema |
| `npx prisma migrate dev` | Create and apply migrations |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma db push` | Push schema without migrations |
| `npx prisma studio` | Open database GUI at localhost:5555 |
| `npx prisma db pull` | Pull schema from existing database |
| `npx prisma format` | Format schema.prisma file |
| `npm run db:seed` | Seed database with initial data |

### View Database with Prisma Studio

```bash
npx prisma studio
```

Opens a web GUI at http://localhost:5555 to view and edit data.

## ▶ Running the Application

### Development Mode

```bash
npm run dev
```

Runs the app at http://localhost:3000 with hot-reload enabled.

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Useful Scripts

```json
{
  "dev": "next dev",                    // Start development server
  "build": "next build",                // Build for production
  "start": "next start",                // Start production server
  "lint": "next lint",                  // Run ESLint
  "db:seed": "tsx prisma/seed.ts",      // Seed database
  "db:push": "npx prisma db push",      // Push schema to DB
  "db:migrate": "npx prisma migrate dev" // Create and run migrations
}
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- Manage users (create, update, change roles)
- Create and manage appraisal templates
- Assign templates to employees
- Review employee submissions
- View all analytics and reports
- **Cannot:** Demote own admin role (security)

### Manager
- Create and manage appraisal templates
- Assign templates to employees
- Review employee submissions
- View submission analytics
- **Cannot:** Access user management

### Employee
- View assigned appraisals
- Fill out self-assessments
- Submit appraisals before deadline
- View review scores and feedback
- **Cannot:** Access admin features or review others

## 🔑 Default Credentials

After running `npm run db:seed`, use these credentials to login:

**Admin Account:**
- Email: `admin@performance-management.com`
- Password: `Admin@123456`

⚠️ **IMPORTANT:** Change the admin password immediately after first login!

**To create additional users:**
1. Login as admin
2. Navigate to **Users** section
3. Register new users or change existing user roles

## 📁 Project Structure

```
performance-management-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migration history
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── dashboard/         # Protected dashboard pages
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── appraisals/    # Template management
│   │   │   ├── my-appraisals/ # Employee appraisals
│   │   │   ├── reviews/       # Submission reviews
│   │   │   └── users/         # User management (admin)
│   │   │
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── users/         # User management
│   │   │   ├── appraisals/    # Appraisal CRUD
│   │   │   └── employees/     # Employee data
│   │   │
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   │
│   │   └── dashboard/         # Dashboard components
│   │       ├── DashboardCharts.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── AppraisalContext.tsx # Appraisal state
│   │
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── middleware.ts      # Auth middleware
│   │   ├── email.ts           # Email service
│   │   └── utils.ts           # Utility functions
│   │
│   └── types/
│       ├── auth.types.ts      # Auth TypeScript types
│       └── appraisal.types.ts # Appraisal TypeScript types
│
├── public/                    # Static assets
├── .env.local                 # Environment variables (create this)
├── .gitignore                 # Git ignore rules
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### Users (Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | List all users | Admin |
| PUT | `/api/users` | Update user role | Admin |

### Employees

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/employees` | List employees | Admin/Manager |

### Appraisal Templates

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/appraisals/templates` | List templates | Admin/Manager |
| POST | `/api/appraisals/templates` | Create template | Admin/Manager |
| GET | `/api/appraisals/templates/:id` | Get template | Admin/Manager |
| PUT | `/api/appraisals/templates/:id` | Update template | Admin/Manager |
| DELETE | `/api/appraisals/templates/:id` | Delete template | Admin/Manager |
| POST | `/api/appraisals/templates/:id/publish` | Publish template | Admin/Manager |

### Submissions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/appraisals/submissions` | List submissions | All |
| GET | `/api/appraisals/submissions/:id` | Get submission | All |
| PUT | `/api/appraisals/submissions/:id` | Update submission | Employee |
| POST | `/api/appraisals/submissions/:id/submit` | Submit appraisal | Employee |

### Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/appraisals/reviews` | List reviews | Admin/Manager |
| POST | `/api/appraisals/reviews` | Create review | Admin/Manager |
| GET | `/api/appraisals/reviews/:id` | Get review | Admin/Manager |
| PUT | `/api/appraisals/reviews/:id` | Update review | Admin/Manager |

### API Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token from the login response and store it in localStorage.

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add all variables from `.env.local`

5. **Database:** Use a managed PostgreSQL service:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Railway](https://railway.app/)
   - [Neon](https://neon.tech/)
   - [Supabase](https://supabase.com/)
   - [AWS RDS](https://aws.amazon.com/rds/)

### Deploy to Other Platforms

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

**Render:**
1. Connect your GitHub repository
2. Select "Web Service"
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

**AWS / Azure / Google Cloud:**
- Use Docker container or traditional deployment
- Set up managed PostgreSQL (RDS/Azure Database/Cloud SQL)
- Configure environment variables
- Run migrations: `npx prisma migrate deploy`

### Production Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` to production domain
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Use production PostgreSQL database
- [ ] Configure SMTP for email (SendGrid/AWS SES)
- [ ] Enable SSL/TLS for database connections
- [ ] Change default admin password
- [ ] Set up database backups
- [ ] Configure CORS if needed
- [ ] Enable error tracking (Sentry)
- [ ] Set up monitoring and logging
- [ ] Configure CI/CD pipeline

## 🐛 Troubleshooting

### Database Connection Issues

**Error: Connection refused**
```bash
# Check if PostgreSQL is running
# Windows
net start postgresql-x64-15

# macOS
brew services restart postgresql@15

# Linux
sudo systemctl status postgresql
```

**Error: Authentication failed**
- Verify `DATABASE_URL` in `.env.local`
- Check PostgreSQL username and password
- Ensure database exists: `psql -U postgres -l`

### Prisma Issues

**Error: Table does not exist**
```bash
# Run migrations
npx prisma migrate dev

# Or push schema
npx prisma db push
```

**Error: Prisma Client out of sync**
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Port Already in Use

```bash
# Windows - Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Lock File Issues

```bash
# Remove Next.js lock file
Remove-Item -Path ".next\dev\lock" -Force

# Clear Next.js cache
Remove-Item -Recurse -Force .next
```

### Email Not Sending

- Verify SMTP credentials in `.env.local`
- For Gmail, use App Passwords (not account password)
- Check SMTP port (usually 587 for TLS)
- Test with: https://www.smtper.net/

### Build Errors

```bash
# Clear cache and rebuild
Remove-Item -Recurse -Force .next
npm run build
```

### Token Expiration

- JWT tokens expire after 7 days
- User must re-login after expiration
- Clear localStorage and login again

## 📝 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)

## 📄 License

This project is private and proprietary.

## 👨‍💻 Support

For issues, questions, or feature requests, contact the development team.
