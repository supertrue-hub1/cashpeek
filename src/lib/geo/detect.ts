import type { CitySlug } from '../seo/slugs';
import { DEFAULT_CITY, CITIES_LIST } from '../cities';

export interface GeoLocationResult {
  city: CitySlug;
  cityName: string;
  detected: boolean;
  source: 'ip' | 'cookie' | 'default';
}

/**
 * Определить город по IP через внешний API
 * Используем бесплатный ip-api.com (без ключа, 45 запросов/мин)
 */
export async function detectCityByIP(ip: string): Promise<CitySlug | null> {
  // Пропускаем локальные IP
  if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null;
  }

  try {
    // ip-api.com - бесплатный, без ключа
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city&lang=ru`, {
      signal: AbortSignal.timeout(3000), // 3 секунды таймаут
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== 'success' || !data.city) {
      return null;
    }

    // Ищем город в нашем списке по названию
    const cityName = data.city as string;
    const found = CITIES_LIST.find(
      ([_, city]) => city.name.toLowerCase() === cityName.toLowerCase()
    );

    return found ? found[0] : null;
  } catch (error) {
    console.error('[geo] IP detection error:', error);
    return null;
  }
}

/**
 * Извлечь IP из заголовков запроса
 * Поддерживает: Vercel, Cloudflare, Nginx, Caddy
 */
export function extractIPFromHeaders(headers: Headers): string {
  // Cloudflare
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Vercel / общий reverse proxy
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Берем первый IP из списка
    return xForwardedFor.split(',')[0].trim();
  }

  // Nginx / Caddy
  const realIP = headers.get('x-real-ip');
  if (realIP) return realIP;

  return 'unknown';
}

/**
 * Получить результат геолокации с fallback
 */
export async function getGeoLocation(ip: string): Promise<GeoLocationResult> {
  // Пытаемся определить по IP
  const detectedSlug = await detectCityByIP(ip);

  if (detectedSlug) {
    const city = CITIES_LIST.find(([slug]) => slug === detectedSlug);
    return {
      city: detectedSlug,
      cityName: city?.[1].name || 'Москва',
      detected: true,
      source: 'ip',
    };
  }

  // Fallback на город по умолчанию
  return {
    city: DEFAULT_CITY,
    cityName: 'Москва',
    detected: false,
    source: 'default',
  };
}
