import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getGeoLocation, extractIPFromHeaders } from '@/lib/geo/detect';
import { CITY_COOKIE_NAME } from '@/lib/geo/cookie';
import type { CitySlug } from '@/lib/seo/slugs';
import { DEFAULT_CITY } from '@/lib/cities';

export const dynamic = 'force-dynamic';

interface GeoResponse {
  city: CitySlug;
  cityName: string;
  detected: boolean;
  source: 'ip' | 'cookie' | 'default';
}

export async function GET(request: Request): Promise<NextResponse<GeoResponse>> {
  // Сначала проверяем cookie
  const cookieStore = await cookies();
  const existingCity = cookieStore.get(CITY_COOKIE_NAME)?.value;

  if (existingCity) {
    // Валидируем что это существующий slug
    const { CITIES } = await import('@/lib/seo/slugs');
    if (existingCity in CITIES) {
      const city = CITIES[existingCity as CitySlug];
      return NextResponse.json({
        city: existingCity as CitySlug,
        cityName: city.name,
        detected: true,
        source: 'cookie',
      });
    }
  }

  // Определяем по IP
  const ip = extractIPFromHeaders(request.headers);
  const result = await getGeoLocation(ip);

  // Устанавливаем cookie если определили по IP
  if (result.detected && result.source === 'ip') {
    const response = NextResponse.json(result);
    response.cookies.set(CITY_COOKIE_NAME, result.city, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 год
      sameSite: 'lax',
      httpOnly: false, // Доступен для JS
    });
    return response;
  }

  return NextResponse.json(result);
}

/**
 * POST - сохранение выбранного города
 */
export async function POST(request: Request): Promise<NextResponse<{ success: boolean }>> {
  const body = await request.json();
  const { city } = body as { city: CitySlug };

  // Валидация
  const { CITIES } = await import('@/lib/seo/slugs');
  if (!(city in CITIES)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(CITY_COOKIE_NAME, city, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  });

  return response;
}
