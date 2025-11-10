# 🔐 Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your Domlii Dashboard.

## 📋 Prerequisites

- Google Cloud Console account
- Next.js application with NextAuth.js configured
- MongoDB database

## 🚀 Setup Steps

### 1. Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project or select an existing one**

3. **Enable the Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" for user type
   - Fill in the required fields:
     - App name: `Domlii Dashboard`
     - User support email: Your email
     - Developer contact information: Your email

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Set authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```

6. **Copy your credentials**
   - Client ID: `GOOGLE_CLIENT_ID`
   - Client Secret: `GOOGLE_CLIENT_SECRET`

### 2. Environment Variables Setup

Add these variables to your `.env.local` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id-from-console"
GOOGLE_CLIENT_SECRET="your-google-client-secret-from-console"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Database
MONGODB_URI="your-mongodb-connection-string"
```

### 3. Verify Implementation

The following files have been updated with Google authentication:

- ✅ `src/auth.ts` - Added Google provider
- ✅ `src/app/(login)/login/login-form/index.tsx` - Added Google sign-in button
- ✅ `src/app/(register)/register/register-form/index.tsx` - Added Google sign-in button
- ✅ `prisma/schema.prisma` - Made password optional for OAuth users

## 🎯 Features Implemented

### Login Flow
- **Google Sign-in Button**: Styled to match your design system
- **Loading States**: Button shows "Signing in..." during authentication
- **Error Handling**: Toast notifications for failed authentication
- **Redirect Support**: Maintains redirect URL after authentication

### Register Flow
- **Consistent UI**: Same Google button styling as login
- **OAuth Registration**: New users can register via Google
- **Seamless Experience**: Automatic account creation for new Google users

### Database Integration
- **Prisma Adapter**: Seamless database integration
- **Account Linking**: Multiple auth methods for same email
- **Session Management**: JWT and database sessions supported

## 🔧 Technical Implementation

### NextAuth Configuration
```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... other providers
]
```

### Enhanced Callbacks
- **JWT Callback**: Handles user data and provider info
- **Session Callback**: Manages session data
- **SignIn Callback**: Controls authentication flow

### Database Schema
- **Optional Password**: Users can sign in with Google without password
- **Account Model**: Stores OAuth provider information
- **Session Model**: Manages user sessions

## 🧪 Testing

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to login page**:
   ```
   http://localhost:3000/login
   ```

3. **Click "Google" button**
4. **Complete Google OAuth flow**
5. **Verify successful authentication**

## 🔐 Security Features

- **CSRF Protection**: Built-in NextAuth.js protection
- **Secure Cookies**: HTTP-only, secure cookies
- **JWT Encryption**: Encrypted session tokens
- **Account Verification**: Email verification through Google

## 🚨 Troubleshooting

### Common Issues

1. **"Redirect URI Mismatch"**
   - Verify redirect URI in Google Console matches your domain
   - Check both development and production URLs

2. **"Client ID not found"**
   - Ensure environment variables are set correctly
   - Restart your development server

3. **"Authentication failed"**
   - Check Google Console API quotas
   - Verify OAuth consent screen is published

### Debug Mode
Enable debug mode in `src/auth.ts`:
```typescript
debug: process.env.NODE_ENV === 'development',
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter Documentation](https://authjs.dev/reference/adapter/prisma)

---

🎉 **Congratulations!** Your Google authentication is now set up and ready to use!