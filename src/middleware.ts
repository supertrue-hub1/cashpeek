/**
 * Middleware для защиты маршрутов
 * Защита админ-панели и личного кабинета
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Получаем токен сессии
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
  });

  // Защита админ-панели
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'admin' && token.role !== 'editor') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Защита личного кабинета
  if (pathname.startsWith('/cabinet')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Защита API роутов пользователя
  if (pathname.startsWith('/api/user') || 
      pathname.startsWith('/api/favorites') || 
      pathname.startsWith('/api/search-history')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Редирект авторизованных пользователей со страниц входа
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cabinet/:path*',
    '/admin/:path*',
    '/api/favorites/:path*',
    '/api/search-history/:path*',
    '/api/user/:path*',
    '/login',
    '/register',
  ],
};
