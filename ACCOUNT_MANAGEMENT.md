# Account Management Features

This document outlines the account management functionality added to the Performance Management System.

## Features Added

### 1. Account Settings Page
- **Location**: `/dashboard/account`
- **Access**: All authenticated users (admin, manager, employee)
- **Features**:
  - Profile information editing (name, email)
  - Avatar upload with AWS S3 integration
  - Password change functionality
  - Account information display

### 2. Avatar Upload with AWS S3

#### Setup Requirements

1. **AWS S3 Bucket Configuration**
   ```bash
   # Create an S3 bucket for avatar storage
   aws s3 mb s3://performance-management-avatars --region us-west-2
   ```

2. **Environment Variables**
   Add the following to your `.env` file:
   ```env
   AWS_REGION=us-west-2
   AWS_ACCESS_KEY_ID=your_aws_access_key_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
   AWS_S3_BUCKET_NAME=performance-management-avatars
   ```

3. **S3 Bucket Policy**
   Configure your S3 bucket with public read access for uploaded avatars:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::performance-management-avatars/*"
       }
     ]
   }
   ```

#### Upload Features
- **File size limit**: 2MB maximum
- **Supported formats**: All image types (JPG, PNG, GIF, etc.)
- **Automatic processing**: Files are uploaded to S3 with unique names
- **URL generation**: Automatic generation of public S3 URLs

### 3. Database Changes

#### New Column Added
- Added `avatar` field to the `users` table to store S3 URLs
- Migration: `20260211073000_add_avatar_to_users`

#### Updated Models
- `User` model now includes avatar field
- AuthContext updated to support user profile updates

### 4. API Endpoints

#### Profile Update
- **Endpoint**: `PUT /api/account/profile`
- **Purpose**: Update user name and email
- **Authentication**: Required (Bearer token)

#### Password Change
- **Endpoint**: `PUT /api/account/password`
- **Purpose**: Change user password with current password verification
- **Authentication**: Required (Bearer token)

#### Avatar Upload
- **Endpoint**: `POST /api/account/avatar`
- **Purpose**: Upload avatar image to S3 and update user profile
- **Authentication**: Required (Bearer token)
- **Content-Type**: `multipart/form-data`

### 5. Security Features

#### Password Requirements
- Minimum 6 characters
- Current password verification required for changes

#### File Upload Security
- File type validation (images only)
- File size limits (2MB max)
- Unique file naming to prevent conflicts

#### Access Control
- Users can only update their own profiles
- JWT token verification for all operations

### 6. User Interface Features

#### Avatar Display
- **Fallback**: User initials when no avatar is set
- **Responsive**: Works on all screen sizes
- **Loading states**: Progress indicators during upload

#### Form Validation
- Real-time validation for password matching
- Email format validation
- Required field validation

#### User Feedback
- Success/error messages for all operations
- Loading states for better UX

## Usage Instructions

### For Users
1. Navigate to "Account Settings" in the sidebar
2. Upload a new avatar by clicking "Change Avatar"
3. Update your name and email in the profile section
4. Change your password using the security section

### For Developers
1. Ensure AWS credentials are configured
2. Run the database migration: `npx prisma migrate dev`
3. Update environment variables with S3 configuration
4. Test avatar upload functionality

## Dependencies Added
- `@aws-sdk/client-s3`: AWS S3 integration
- `uuid`: Unique file naming
- `@mui/material`: Enhanced UI components

## File Structure
```
src/
├── app/
│   ├── dashboard/account/page.tsx          # Account management page
│   └── api/account/
│       ├── profile/route.ts               # Profile update API
│       ├── password/route.ts              # Password change API
│       └── avatar/route.ts                # Avatar upload API
├── contexts/AuthContext.tsx               # Updated with user update function
└── types/auth.types.ts                   # Updated User interface

```

## Future Enhancements
- Image resizing and optimization
- Multiple image formats support
- Bulk avatar operations for admins
- Avatar change history tracking