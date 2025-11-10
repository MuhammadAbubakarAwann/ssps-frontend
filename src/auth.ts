import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prismaClientGenerator from './lib/prismaClient';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';

const prisma = prismaClientGenerator();

// Add this function to verify Turnstile token
// async function verifyTurnstileToken(token: string): Promise<boolean> {
//   if (!token) return false;
  
//   const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
//   if (!secretKey) {
//     console.error('Missing TURNSTILE_SECRET_KEY environment variable');
//     return false;
//   }

//   try {
//     const formData = new URLSearchParams();
//     formData.append('secret', secretKey);
//     formData.append('response', token);
    
//     const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: formData.toString()
//     });

//     const data = await response.json();
    
//     if (data.success) 
//       return true;
//      else {
//       console.error('Turnstile verification failed:', data.error_codes);
//       return false;
//     }
//   } catch (error) {
//     console.error('Error verifying Turnstile token:', error);
//     return false;
//   }
// }

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        turnstileToken: { label: 'Turnstile Token', type: 'text' } // Add this line
      },
      async authorize(credentials) {
        if (!credentials?.email) 
          throw new CredentialsSignin('Email is required');
        
        // // Add Turnstile verification
        // if (!credentials.turnstileToken)
        //   throw new CredentialsSignin('Security verification failed');
          
        // const turnstileVerified = await verifyTurnstileToken(credentials.turnstileToken as string);
        
        // if (!turnstileVerified)
        //   throw new CredentialsSignin('Security verification failed. Please try again.');

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string
          }
        });

        if (!user) 
          throw new CredentialsSignin('No user found with this email');
        
        if (!credentials.password) 
          throw new CredentialsSignin('Password is required');
        
        // Check if user has a password (for OAuth users, password might be null)
        if (!user.password) 
          throw new CredentialsSignin('Please sign in with Google or reset your password');
        
        const passwordString = credentials.password as string;

        const passwordMatch = await bcrypt.compare(passwordString, user.password);

        if (!passwordMatch) 
          throw new CredentialsSignin('Invalid password');
        
        return user;
      }
    })
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.name = user.name || '';
        session.user.email = user.email || '';
        session.user.image = user.image || '';
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider === 'google') {
        try {
          // Check if user exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true }
          });

          if (existingUser) {
            // Check if this Google account is already linked
            const googleAccount = existingUser.accounts.find(
              acc => acc.provider === 'google' && acc.providerAccountId === account.providerAccountId
            );

            if (!googleAccount) {
              // Link the Google account to the existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string,
                }
              });

              // Update user with Google profile information if missing
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: existingUser.name || user.name,
                  image: existingUser.image || user.image,
                }
              });
            }
          }
          
          return true;
        } catch (error) {
          console.error('Error linking Google account:', error);
          return false;
        }
      }
      
      // For credentials provider, use existing logic
      if (account?.provider === 'credentials') {
        return true;
      }
      
      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_DEBUG === 'true',
  secret: process.env.NEXTAUTH_SECRET,
});