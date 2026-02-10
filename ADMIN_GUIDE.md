# Admin Features Guide

## Auto-Generated Admin User

A default admin user has been created during database seeding:

### Default Admin Credentials
- **Email**: `admin@performance-management.com`
- **Password**: `Admin@123456`

> ⚠️ **Important**: Please change the admin password after first login for security!

## Creating Managers (Admin Only)

Only admin users can create manager accounts through the API.

### API Endpoint: Create Manager
- **URL**: `POST /api/admin/create-manager`
- **Authentication**: Bearer token (Admin only)
- **Headers**: 
  ```
  Authorization: Bearer <your-jwt-token>
  Content-Type: application/json
  ```

### Request Body
```json
{
  "name": "Manager Name",
  "email": "manager@company.com",
  "password": "SecurePassword@123",
  "department": "Sales", // Optional
  "position": "Sales Manager" // Optional
}
```

### Response (Success)
```json
{
  "message": "Manager created successfully",
  "manager": {
    "id": "uuid",
    "name": "Manager Name",
    "email": "manager@company.com",
    "role": "manager",
    "department": "Sales",
    "position": "Sales Manager",
    "createdAt": "2026-02-10T..."
  }
}
```

### API Endpoint: List All Managers
- **URL**: `GET /api/admin/create-manager`
- **Authentication**: Bearer token (Admin only)
- **Headers**: 
  ```
  Authorization: Bearer <your-jwt-token>
  ```

### Response
```json
{
  "message": "Managers retrieved successfully",
  "managers": [
    {
      "id": "uuid",
      "name": "Manager Name",
      "email": "manager@company.com",
      "role": "manager",
      "department": "Sales",
      "position": "Sales Manager",
      "createdAt": "2026-02-10T...",
      "updatedAt": "2026-02-10T..."
    }
  ],
  "count": 1
}
```

## Authentication Flow

1. **Login as Admin**: Use the login endpoint with admin credentials
2. **Get JWT Token**: Save the token from login response
3. **Use Token**: Include token in Authorization header for admin operations

### Example: Login as Admin
```bash
POST /api/auth/login
{
  "email": "admin@performance-management.com",
  "password": "Admin@123456"
}
```

### Example: Create Manager
```bash
POST /api/admin/create-manager
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "Manager@123456",
  "department": "Engineering",
  "position": "Engineering Manager"
}
```

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "Authorization header required"
}
```

**403 Forbidden**
```json
{
  "error": "Admin access required"
}
```

**409 Conflict**
```json
{
  "error": "User with this email already exists"
}
```

**400 Bad Request**
```json
{
  "error": "Password must contain at least one uppercase letter"
}
```

## Security Features

- ✅ JWT-based authentication
- ✅ Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
- ✅ Role-based access control (admin only)
- ✅ Email uniqueness validation
- ✅ Secure password hashing with bcrypt
- ✅ Token verification for each admin request

## Database Commands

### Run Database Seed (Create Admin)
```bash
npm run db:seed
```

### Push Schema Changes
```bash
npm run db:push
```

### View Database
```bash
npm run db:studio
```