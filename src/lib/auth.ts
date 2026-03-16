/**
 * Auth Configuration for NextAuth v4
 * Credentials Provider (Email + Password)
 * Без PrismaAdapter - работаем напрямую с JWT и БД
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { compare } from 'bcrypt';
import { randomUUID } from 'crypto';

// Расширяем типы сессии
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
  
  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  // Secret для JWT шифрования
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
  
  // Без adapter - используем JWT стратегию
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email;
        const password = credentials.password;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      console.log(`[Auth] User signed in: ${user.email}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Получить текущую сессию
 */
export async function auth() {
  return getServerSession(authOptions);
}

/**
 * Получить текущего пользователя или null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Проверить, авторизован ли пользователь
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session;
}

/**
 * Проверить роль пользователя
 */
export async function hasRole(role: string | string[]) {
  const session = await auth();
  if (!session) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(session.user.role);
}

/**
 * Сгенерировать токен для верификации
 */
export async function generateVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}
