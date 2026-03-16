/**
 * LocalBusiness Schema.org generator
 * https://schema.org/LocalBusiness
 * Для гео-страниц (займы в городе)
 */

export interface LocalBusinessData {
  cityName: string;
  citySlug: string;
  region?: string;
  population?: number;
  offersCount?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Создаёт LocalBusiness schema для города
 * Используется на страницах /zaimy/v-[city]
 */
export function createLocalBusinessSchema(data: LocalBusinessData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: `Займы в ${data.cityName}`,
    description: `Сервис подбора микрозаймов в ${data.cityName}. ${data.offersCount || 'Более 20'} проверенных МФО с высоким процентом одобрения.`,
    url: `${BASE_URL}/zaimy/v-${data.citySlug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: data.cityName,
      addressRegion: data.region,
      addressCountry: 'Russia',
    },
    areaServed: {
      '@type': 'City',
      name: data.cityName,
      population: data.population,
    },
    priceRange: '$$',
    openingHours: 'Mo-Su 00:00-23:59', // 24/7
    availableService: [
      {
        '@type': 'FinancialProduct',
        name: 'Микрозайм',
        description: 'Краткосрочный займ на карту',
      },
      {
        '@type': 'FinancialProduct',
        name: 'Займ на карту',
        description: 'Мгновенное зачисление на банковскую карту',
      },
    ],
  };
}

/**
 * Создаёт City schema
 */
export function createCitySchema(data: LocalBusinessData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: data.cityName,
    description: `Информация о займах и микрокредитах в городе ${data.cityName}`,
    population: data.population,
    containedInPlace: data.region ? {
      '@type': 'AdministrativeArea',
      name: data.region,
    } : undefined,
  };
}
