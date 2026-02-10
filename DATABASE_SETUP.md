# Database Setup Guide

## Using Prisma ORM

This project uses **Prisma** as the ORM for database operations. Prisma provides type-safe database access, auto-generated queries, and easy migrations.

### Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** 18+ installed
3. Project dependencies installed (`npm install`)

## Quick Start

### 1. Install PostgreSQL

#### Windows
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

#### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Open PostgreSQL command line
psql postgres

# Create database
CREATE DATABASE performance_management;

# Exit
\q
```

### 3. Configure Environment Variables

Update your `.env.local` file:

```env
# Prisma Database URL (required)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/performance_management

# JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@performancemanagement.com
```

### 4. Generate Prisma Client

After configuring the DATABASE_URL, generate the Prisma client:

```bash
npx prisma generate
```

### 5. Push Schema to Database

Push the Prisma schema to your database:

```bash
npx prisma db push
```

Or create a migration (recommended for production):

```bash
npx prisma migrate dev --name init
```

### 6. (Optional) View Database with Prisma Studio

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to browse and edit your data.

### 7. Start Development Server

```bash
npm run dev
```

## Prisma Commands Reference

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generate Prisma Client from schema |
| `npx prisma db push` | Push schema changes (without migrations) |
| `npx prisma migrate dev` | Create and apply migrations |
| `npx prisma migrate deploy` | Apply migrations in production |
| `npx prisma studio` | Open database GUI |
| `npx prisma db pull` | Introspect existing database |
| `npx prisma format` | Format schema file |

## Project Structure

```
├── prisma/
│   └── schema.prisma      # Database schema definition
├── src/
│   ├── lib/
│   │   └── db.ts          # Prisma client singleton
│   └── app/
│       └── api/
│           └── auth/      # Authentication API routes
└── .env.local             # Environment variables
```

## Database Schema Overview

### Tables

1. **users** - User accounts (admin, manager, employee)
2. **password_reset_tokens** - Password reset tokens
3. **appraisal_templates** - Performance appraisal templates
4. **goals** - Goals within templates
5. **template_assignments** - Template-to-employee assignments
6. **appraisal_submissions** - Employee responses
7. **goal_responses** - Employee answers per goal
8. **appraisal_reviews** - Manager reviews and scores
9. **goal_reviews** - Manager scores per goal

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Example: Register First User (Admin)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin@123",
    "role": "admin",
    "department": "Management",
    "position": "System Administrator"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL service is running
- Verify port 5432 is not blocked by firewall
- Check credentials in `.env.local`

### Permission Denied
- Ensure your PostgreSQL user has proper permissions
- Try connecting as `postgres` superuser first

### Table Already Exists
- The schema uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- To start fresh, drop the database and recreate:
  ```sql
  DROP DATABASE performance_management;
  CREATE DATABASE performance_management;
  ```

## Development Tips

### View Database with GUI Tools
- **pgAdmin** (comes with PostgreSQL)
- **DBeaver** (free, cross-platform)
- **TablePlus** (macOS)
- **VS Code Extension: PostgreSQL** by Chris Kolkman

### Reset Database
```bash
# Drop all tables and recreate
psql -U postgres -d performance_management -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then re-run schema
psql -U postgres -d performance_management -f database/schema.sql
```

### Check Running Queries
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'performance_management';
```

## Production Considerations

1. **Security**
   - Change default passwords
   - Use strong JWT_SECRET
   - Enable SSL for database connections
   - Use connection pooling

2. **Performance**
   - Add appropriate indexes (already included in schema)
   - Monitor slow queries
   - Set up regular backups

3. **Email**
   - Configure SMTP settings in `.env.local`
   - Use a proper email service (SendGrid, AWS SES, etc.)

4. **Hosting**
   - Consider managed PostgreSQL (AWS RDS, Railway, Supabase, Neon)
   - Set up automatic backups
   - Monitor database health
