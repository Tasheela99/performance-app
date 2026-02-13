# Vercel Deployment Guide

## Environment Variables Required

Add these environment variables in your Vercel project settings:

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
```
**Important:** 
- Use a cloud PostgreSQL database (not localhost)
- Options: Vercel Postgres, Supabase, Railway, Neon, etc.
- Connection string must be accessible from Vercel's servers

### Authentication
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```
Generate a strong secret: `openssl rand -base64 32`

### Email (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```
**For Gmail:** Use an App Password, not your regular password

### AWS S3 (for avatar uploads)
```
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

## Deployment Steps

### 1. Set up Database

Option A: **Vercel Postgres** (Recommended)
```bash
# In Vercel dashboard, add Postgres from the Storage tab
# Copy the DATABASE_URL connection string
```

Option B: **Supabase** (Free tier available)
```bash
# Create project at supabase.com
# Get connection string from Settings > Database
# Use the "Session pooler" connection string for Vercel
```

Option C: **Railway** or **Neon**
```bash
# Create PostgreSQL database
# Copy the public connection string
```

### 2. Run Database Migrations

After deploying, run migrations:
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run migration in Vercel environment
vercel env pull .env.local
npx prisma migrate deploy
```

Or use Vercel's build command by updating `vercel.json`:
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

### 3. Deploy

```bash
# Commit changes
git add .
git commit -m "Configure for production deployment"
git push origin main

# Deploy to Vercel
vercel --prod
```

### 4. Verify Deployment

Visit these endpoints to verify:
- `https://your-app.vercel.app/api/health` - Check database connection
- `https://your-app.vercel.app/auth/login` - Test the app

## Troubleshooting

### 500 Internal Server Error

1. **Check health endpoint:** Visit `/api/health` to see connection status
2. **Verify DATABASE_URL:** Make sure it's set in Vercel environment variables
3. **Check logs:** Run `vercel logs` to see detailed error messages
4. **Prisma Client:** Ensure `postinstall` script runs: `"postinstall": "prisma generate"`

### Database Connection Issues

```bash
# Test connection locally with production env
vercel env pull .env.local
npm run db:push
```

### CORS Errors

- CORS headers are already configured in API routes
- Make sure you're not setting `NEXT_PUBLIC_API_URL` in Vercel
- App uses relative URLs (`/api/*`) automatically

### Missing Tables

Run migrations after setting DATABASE_URL:
```bash
# In Vercel dashboard > Settings > Environment Variables
# Add DATABASE_URL

# Then deploy
git push origin main
```

## Build Configuration

The app automatically:
- Generates Prisma Client via `postinstall` script
- Uses Next.js API routes (no CORS needed)
- Supports serverless deployment

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use database connection pooling for production
- [ ] Set up proper AWS S3 bucket permissions
- [ ] Use SMTP app passwords (not regular passwords)
- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Never commit sensitive credentials

## Database Recommendations

For production:
- **Connection Pooling:** Use Prisma Data Proxy or PgBouncer
- **Supabase:** Use "Session mode" for better compatibility
- **Neon:** Supports automatic scaling
- **Vercel Postgres:** Built-in integration with Vercel

## Monitoring

- **Vercel Dashboard:** Monitor build and runtime logs
- **Health Check:** `/api/health` endpoint shows system status
- **Database:** Use your provider's dashboard for query monitoring
