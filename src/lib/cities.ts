import type { CitySlug } from './seo/slugs';
import { CITIES } from './seo/slugs';

export type City = {
  slug: CitySlug;
  name: string;
  preposition: string;
  genitive: string;
  population: number;
  popular?: boolean;
};

// Популярные города (показываем вверху списка)
export const POPULAR_CITY_SLUGS: CitySlug[] = [
  'moskva',
  'sankt-peterburg',
  'novosibirsk',
  'ekaterinburg',
  'kazan',
  'nizhniy-novgorod',
];

// Преобразуем CITIES в полный список с дополнительными полями
export const CITIES_LIST: [CitySlug, City][] = Object.entries(CITIES).map(([slug, city]) => [
  slug as CitySlug,
  {
    ...city,
    slug: slug as CitySlug,
    popular: POPULAR_CITY_SLUGS.includes(slug as CitySlug),
  },
]);

export const DEFAULT_CITY: CitySlug = 'moskva';

// Города по популярности (для UI)
export const POPULAR_CITIES = CITIES_LIST.filter(([_, city]) => city.popular);
export const OTHER_CITIES = CITIES_LIST.filter(([_, city]) => !city.popular);

/**
 * Найти город по slug
 */
export function getCityBySlug(slug: CitySlug): City | undefined {
  return CITIES_LIST.find(([s]) => s === slug)?.[1];
}

/**
 * Поиск городов по названию
 */
export function findCity(search: string): City[] {
  const query = search.toLowerCase().trim();
  if (!query) return [];

  return CITIES_LIST.filter(([_, city]) =>
    city.name.toLowerCase().includes(query)
  ).map(([_, city]) => city);
}

/**
 * Поиск с разделением на популярные и остальные
 */
export function findCityGrouped(search: string): {
  popular: City[];
  other: City[];
} {
  const query = search.toLowerCase().trim();

  const all = query
    ? CITIES_LIST.filter(([_, city]) => city.name.toLowerCase().includes(query))
    : CITIES_LIST;

  return {
    popular: all.filter(([_, city]) => city.popular).map(([_, city]) => city),
    other: all.filter(([_, city]) => !city.popular).map(([_, city]) => city),
  };
}
