# Authentication System Documentation

## Overview
This authentication system is built using React Context API for state management, providing a clean and scalable solution for the Performance Management System.

## Folder Structure

```
src/
├── app/
│   ├── (auth)/                    # Authentication routes group
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── register/
│   │   │   └── page.tsx          # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx          # Forgot password page
│   │   ├── reset-password/
│   │   │   └── page.tsx          # Reset password page
│   │   └── layout.tsx            # Auth layout
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard (protected)
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── page.tsx                  # Home page (redirects)
│   └── globals.css               # Global styles
├── components/
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx            # Button component
│       ├── Input.tsx             # Input component with icons
│       └── Card.tsx              # Card component
├── contexts/
│   └── AuthContext.tsx           # Authentication context & provider
└── types/
    └── auth.types.ts             # TypeScript type definitions
```

## Features

### ✅ Implemented Features
- **Login** - Email/password authentication
- **Registration** - User signup with validation
- **Forgot Password** - Email-based password reset
- **Reset Password** - Token-based password reset
- **Protected Routes** - Dashboard requires authentication
- **Persistent Sessions** - localStorage-based session management
- **Loading States** - User feedback during async operations
- **Form Validation** - Client-side validation for all forms
- **Error Handling** - User-friendly error messages

## Pages

### 1. Login (`/auth/login`)
- Email and password fields with validation
- "Remember me" checkbox
- Link to forgot password
- Link to registration
- Redirects to dashboard on successful login

### 2. Register (`/auth/register`)
- Full name, email, password, confirm password fields
- Password strength requirements
- Terms of service acceptance
- Link to login page
- Redirects to dashboard on successful registration

### 3. Forgot Password (`/auth/forgot-password`)
- Email input for password reset
- Success message with confirmation
- Resend link option
- Back to login link

### 4. Reset Password (`/auth/reset-password`)
- Token validation from URL parameters
- New password and confirm password fields
- Password strength indicator
- Success message with auto-redirect
- Link to request new reset token if expired

### 5. Dashboard (`/dashboard`)
- Protected route (requires authentication)
- Welcome message with user name
- Performance statistics cards
- Recent reviews section
- Upcoming tasks section
- Logout functionality

## Components

### Button
Reusable button component with variants:
- `primary` - Blue background (default)
- `secondary` - Gray background
- `outline` - Border only
- `danger` - Red background

Features:
- Loading state with spinner
- Font Awesome icon support
- Full width option
- Disabled state

### Input
Form input component with:
- Label support
- Error message display
- Font Awesome icon integration
- Built-in validation styling
- forwardRef support for form libraries

### Card
Simple card wrapper with:
- White background
- Shadow styling
- Rounded corners
- Padding

## Authentication Context

### Available Methods

```typescript
const {
  user,              // Current user object or null
  isAuthenticated,   // Boolean authentication status
  isLoading,        // Loading state
  login,            // Login function
  register,         // Registration function
  logout,           // Logout function
  forgotPassword,   // Request password reset
  resetPassword,    // Reset password with token
} = useAuth();
```

### User Object

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
  department?: string;
  position?: string;
}
```

## Usage Examples

### Using Authentication in a Component

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Route Pattern

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

## Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **Font Awesome** for icons
- **Custom gradients** for backgrounds
- **Responsive design** for all screen sizes

## Next Steps - Backend Integration

Currently, the authentication uses mock data. To connect to a real backend:

1. **Create API routes** in `src/app/api/auth/`
2. **Update AuthContext** to call real API endpoints
3. **Add JWT token handling** for secure authentication
4. **Implement refresh token logic** for session management
5. **Add HTTP client** (e.g., axios or fetch wrapper)

### Example API Integration

```typescript
// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
  // ... other methods
};
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Performance Management System
```

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Access the application at `http://localhost:3000`

## Security Considerations

- ✅ Client-side form validation
- ⏳ Server-side validation (TODO)
- ⏳ CSRF protection (TODO)
- ⏳ Rate limiting (TODO)
- ⏳ Secure password hashing (Backend TODO)
- ⏳ JWT token expiration (TODO)
- ⏳ HTTPS enforcement (Production TODO)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Performance Management System
