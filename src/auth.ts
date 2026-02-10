import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';
import prismaClientGenerator from './lib/prismaClient';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import { Role } from '@prisma/client';

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
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        turnstileToken: { label: 'Turnstile Token', type: 'text' } // Add this line
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) 
            return null;
          
          // // Add Turnstile verification
          // if (!credentials.impersonationToken) {
          //   // Only verify Turnstile for regular login (not impersonation)
          //   if (!credentials.turnstileToken)
          //     return null;
              
          //   const turnstileVerified = await verifyTurnstileToken(credentials.turnstileToken as string);
            
          //   if (!turnstileVerified)
          //     return null;
          // }

          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email as string
            }
          });

          if (!user) 
            return null;
          
          if (!credentials.password) 
            return null;
          
          // Check if user has a password (for OAuth users, password might be null)
          if (!user.password) 
            return null;
          
          const passwordString = credentials.password as string;

          const passwordMatch = await bcrypt.compare(passwordString, user.password);

          if (!passwordMatch) 
            return null;
          

          // Transform the user object to match NextAuth User type
          return {
            ...user,
            emailVerified: user.emailVerified ?? null
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 days instead of 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as typeof user & {
          role: Role;
          emailVerified: Date | null;
          createdAt: Date;
          updatedAt: Date;
        };
        
        token.id = extendedUser.id;
        token.name = extendedUser.name || '';
        token.email = extendedUser.email || '';
        token.emailVerified = extendedUser.emailVerified;
        token.image = extendedUser.image || '';
        token.role = extendedUser.role || Role.ADMIN;
        token.createdAt = extendedUser.createdAt;
        token.updatedAt = extendedUser.updatedAt;
        
        // Set token expiration timestamp
        token.exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.name) {
        const extendedToken = token as typeof token & {
          role: Role;
          createdAt: Date;
          updatedAt: Date;
          emailVerified: Date | null;
        };

        const extendedUser = session.user as typeof session.user & {
          role: Role;
          createdAt: Date;
          updatedAt: Date;
          emailVerified: Date | null;
        };

        extendedUser.id = extendedToken.id as string || '';
        extendedUser.name = extendedToken.name;
        extendedUser.email = extendedToken.email || '';
        extendedUser.emailVerified = extendedToken.emailVerified;
        extendedUser.image = extendedToken.image as string;
        extendedUser.role = extendedToken.role || Role.ADMIN;
        extendedUser.createdAt = extendedToken.createdAt || new Date();
        extendedUser.updatedAt = extendedToken.updatedAt || new Date();
        
        session.user = extendedUser;
      }

      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  debug: true
});