import type { CitySlug } from '../seo/slugs';
import { DEFAULT_CITY } from '../cities';

export const CITY_COOKIE_NAME = 'geo_city';
export const CITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 год

/**
 * Получить город из cookie на клиенте
 */
export function getCityFromClientCookie(): CitySlug {
  if (typeof document === 'undefined') return DEFAULT_CITY;
  
  const match = document.cookie.match(new RegExp(`(?:^|; )${CITY_COOKIE_NAME}=([^;]*)`));
  const value = match?.[1];
  
  // Валидация что это реальный slug города
  if (value && isValidCitySlug(value)) {
    return value as CitySlug;
  }
  
  return DEFAULT_CITY;
}

/**
 * Получить город из localStorage (fallback)
 */
export function getCityFromLocalStorage(): CitySlug | null {
  if (typeof window === 'undefined') return null;
  
  const value = localStorage.getItem(CITY_COOKIE_NAME);
  if (value && isValidCitySlug(value)) {
    return value as CitySlug;
  }
  
  return null;
}

/**
 * Сохранить город в cookie и localStorage
 */
export function saveCityToClient(slug: CitySlug): void {
  if (typeof document === 'undefined') return;
  
  // Cookie
  document.cookie = [
    `${CITY_COOKIE_NAME}=${slug}`,
    'path=/',
    `max-age=${CITY_COOKIE_MAX_AGE}`,
    'SameSite=Lax',
  ].join('; ');
  
  // localStorage как backup
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CITY_COOKIE_NAME, slug);
  }
}

/**
 * Проверка валидности slug города
 */
let validCitySlugs: Set<string> | null = null;

function isValidCitySlug(slug: string): boolean {
  if (!validCitySlugs) {
    // Ленивая инициализация - импортируем динамически чтобы избежать circular dependency
    const { CITIES } = require('../seo/slugs');
    validCitySlugs = new Set(Object.keys(CITIES));
  }
  return validCitySlugs.has(slug);
}
