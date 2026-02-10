# Backend API Documentation

## Overview

This application now uses **PostgreSQL** as the database with **Next.js API Routes** for the backend. All authentication operations use real API calls instead of mock data.

## Tech Stack

- **Database**: PostgreSQL
- **Backend**: Next.js App Router API Routes
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer (for password reset)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up PostgreSQL Database**
   - Follow instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - Run the schema migration: `database/schema.sql`

3. **Configure Environment Variables**
   - Copy `.env.local` and update with your database credentials
   - Set a strong `JWT_SECRET`
   - (Optional) Configure SMTP for email

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Authentication API Endpoints

### 1. Register User

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "employee",
  "department": "Engineering",
  "position": "Software Developer"
}
```

**Required Fields**: `name`, `email`, `password`

**Optional Fields**: `role` (defaults to "employee"), `department`, `position`

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Success Response** (201):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "department": "Engineering",
    "position": "Software Developer"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

---

### 2. Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Success Response** (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "department": "Engineering",
    "position": "Software Developer"
  },
  "token": "jwt-token-here"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials

**Frontend Usage**:
- Store the `token` in localStorage
- Store the `user` object in localStorage
- Include token in Authorization header for protected routes

---

### 3. Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "If a user with that email exists, a password reset link has been sent"
}
```

**Behavior**:
- Always returns success (security best practice)
- Generates a unique reset token
- Token expires in 1 hour
- Sends email with reset link (or logs to console if SMTP not configured)

**Error Responses**:
- `400 Bad Request`: Validation errors

---

### 4. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass@123"
}
```

**Success Response** (200):
```json
{
  "message": "Password reset successful"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid/expired/used token, validation errors

---

## Frontend Integration

The `AuthContext` has been updated to call these real APIs:

```tsx
// Login example
await login({ email, password });

// Register example
await register({
  name,
  email,
  password,
  role: 'employee',
  department: 'Engineering',
  position: 'Developer'
});

// Forgot password
await forgotPassword({ email });

// Reset password
await resetPassword({ token, password });
```

## Database Tables

### Users Table
- `id` (UUID, primary key)
- `name` (varchar)
- `email` (varchar, unique)
- `password_hash` (varchar)
- `role` (varchar: admin, manager, employee)
- `department` (varchar, nullable)
- `position` (varchar, nullable)
- `created_at`, `updated_at` (timestamps)

### Password Reset Tokens Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users)
- `token` (varchar, unique)
- `expires_at` (timestamp)
- `used` (boolean)
- `created_at` (timestamp)

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Email Validation**: Regex-based validation
4. **Strong Password Requirements**: Enforced on registration and password reset
5. **Token Expiration**: Reset tokens expire after 1 hour
6. **One-Time Use Tokens**: Reset tokens can only be used once
7. **Secure Error Messages**: Doesn't reveal whether email exists

## Testing the APIs

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "employee"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### Using Postman

1. Import the endpoints into Postman
2. Set `Content-Type: application/json` header
3. Add request body as raw JSON
4. Send requests and verify responses

## Next Steps

1. **Current Status**: ✅ Authentication APIs fully implemented
2. **Next**: Implement appraisal management APIs
   - Create/read/update/delete templates
   - Assign templates to employees
   - Submit appraisal responses
   - Manager review and scoring

## Troubleshooting

### Database Connection Errors
- Check if PostgreSQL is running
- Verify credentials in `.env.local`
- Ensure database exists and schema is applied

### Email Not Sending
- SMTP configuration is optional for development
- Without SMTP, reset links are logged to console
- For production, configure a proper email service

### Token Errors
- Ensure `JWT_SECRET` is set in `.env.local`
- Tokens expire after 7 days by default
- Check console for JWT verification errors

## Environment Variables Reference

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
PGHOST=localhost
PGPORT=5432
PGDATABASE=performance_management
PGUSER=postgres
PGPASSWORD=your_password

# Security
JWT_SECRET=your-secret-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@app.com
```
