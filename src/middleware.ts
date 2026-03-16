/**
 * Middleware для защиты маршрутов
 * Временно отключено для отладки
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Временно отключаем проверку авторизации
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
