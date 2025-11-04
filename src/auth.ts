import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prismaClient';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        impersonationToken: { label: 'Impersonation Token', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials) 
          return null; // No credentials provided
        

        // Handle temporary login via URL token
        if (credentials.password === 'temporary-password' && credentials.email) 
          try {
            const user = await prisma.user.findUnique({
              where: { id: credentials.email as string }
            });
            if (user) 
              return user;
             else 
              throw new Error('Invalid temporary login link.');
            
          } catch (error) {
            console.error('Error during temporary login:', error);
            throw new Error('Error during temporary login.');
          }
        

        // Existing email/password and impersonation token logic
        if (!credentials?.email) throw new Error('Email is required');

        try {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email as string
            }
          });

          if (!user) throw new Error('No user found with this email');

          if (credentials.impersonationToken) {
            if (user.impersonationToken === credentials.impersonationToken) {
              await prisma.user.update({
                where: { id: user.id },
                data: { impersonationToken: null }
              });

              return {
                ...user,
                isImpersonated: true
              };
            }

            throw new Error('Invalid impersonation token');
          }

          if (!credentials.password) throw new Error('Password is required');

          const passwordString = credentials.password as string;

          const passwordMatch = await bcrypt.compare(passwordString, user.password);

          if (!passwordMatch) throw new Error('Invalid password');

          return user;
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || '';
        token.email = user.email || '';
        token.emailVerified = user.emailVerified;
        token.image = user.image || '';
        token.role = user.role;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;

        if (user.isImpersonated) token.isImpersonated = true;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.image = token.image as string;
        session.user.role = token.role as any;
        session.user.createdAt = token.createdAt as Date;
        session.user.updatedAt = token.updatedAt as Date;

        if (token.isImpersonated) session.user.isImpersonated = true;
      }

      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
};

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);