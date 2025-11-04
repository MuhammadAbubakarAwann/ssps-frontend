# Prisma Setup Guide

## Issues Fixed in Schema

### 1. Database Provider Issues
- ❌ **Before**: Using PostgreSQL provider with MongoDB ObjectId types
- ✅ **After**: Consistent PostgreSQL types with `String @id @default(cuid())`

### 2. Field Mapping Issues  
- ❌ **Before**: Using `@map("_id")` and `@db.ObjectId` (MongoDB syntax)
- ✅ **After**: Proper PostgreSQL field mappings with table names

### 3. Missing Models
- ❌ **Before**: Missing `VerificationToken` model required for NextAuth
- ✅ **After**: Complete NextAuth-compatible schema

### 4. Incomplete User Model
- ❌ **Before**: Had `password` field but missing NextAuth standard fields
- ✅ **After**: Standard NextAuth User model without password (handled by providers)

## Setup Instructions

### 1. Environment Setup
Copy the environment file and update with your database URL:
```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/domlii_dashboard"
```

### 2. Generate Prisma Client
```bash
yarn db:generate
```

### 3. Create Database Tables
For development (creates/updates tables directly):
```bash
yarn db:push
```

For production (creates migration files):
```bash
yarn db:migrate
```

### 4. View Database (Optional)
```bash
yarn db:studio
```

## Schema Features

### User Model
- **ID**: CUID for better performance and security
- **Authentication**: NextAuth.js compatible
- **Roles**: ADMIN, USER, MODERATOR
- **Relations**: One-to-many with accounts and sessions

### Account Model  
- **OAuth Support**: For social login providers
- **Token Management**: Access tokens, refresh tokens, etc.
- **Provider Agnostic**: Works with Google, GitHub, etc.

### Session Model
- **Session Management**: For NextAuth.js sessions
- **Expiration Handling**: Automatic cleanup of expired sessions

### VerificationToken Model
- **Email Verification**: For passwordless login
- **Security**: One-time use tokens with expiration

## Usage Examples

### Create User
```typescript
import { createUser } from '@/lib/db'

const result = await createUser({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'USER'
})
```

### Get User with Relations
```typescript
import { getUserByEmail } from '@/lib/db'

const result = await getUserByEmail('user@example.com')
// Includes accounts and sessions
```

### Update User Role
```typescript
import { updateUser } from '@/lib/db'

const result = await updateUser(userId, {
  role: 'ADMIN'
})
```

## Troubleshooting

### "Module has no exported member" Errors
This means Prisma client needs to be regenerated:
```bash
yarn db:generate
```

### Migration Errors
If you get migration conflicts:
```bash
# Reset database (DEVELOPMENT ONLY!)
yarn db:push --force-reset
```

### Connection Errors
1. Check DATABASE_URL format
2. Ensure PostgreSQL is running
3. Verify database exists
4. Check network connectivity

## Next Steps

1. **Install NextAuth.js** for complete authentication system
2. **Add API Routes** for user management
3. **Create UI Components** for user dashboard
4. **Set up OAuth Providers** (Google, GitHub, etc.)