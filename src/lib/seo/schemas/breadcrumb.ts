/**
 * BreadcrumbList Schema.org generator
 * https://schema.org/BreadcrumbList
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Создаёт хлебные крошки для категории займов
 */
export function createCategoryBreadcrumb(categorySlug: string, categoryName: string): object {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
  
  return createBreadcrumbSchema([
    { name: 'Главная', url: BASE_URL },
    { name: 'Займы', url: `${BASE_URL}/zaimy` },
    { name: categoryName, url: `${BASE_URL}/zaimy/${categorySlug}` },
  ]);
}

/**
 * Создаёт хлебные крошки для категории + город
 */
export function createCategoryCityBreadcrumb(
  categorySlug: string,
  categoryName: string,
  citySlug: string,
  cityName: string,
  cityPreposition: string
): object {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
  
  return createBreadcrumbSchema([
    { name: 'Главная', url: BASE_URL },
    { name: 'Займы', url: `${BASE_URL}/zaimy` },
    { name: categoryName, url: `${BASE_URL}/zaimy/${categorySlug}` },
    { name: cityPreposition, url: `${BASE_URL}/zaimy/${categorySlug}/v-${citySlug}` },
  ]);
}

/**
 * Создаёт хлебные крошки для МФО
 */
export function createMfoBreadcrumb(mfoSlug: string, mfoName: string): object {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
  
  return createBreadcrumbSchema([
    { name: 'Главная', url: BASE_URL },
    { name: 'МФО', url: `${BASE_URL}/mfo` },
    { name: mfoName, url: `${BASE_URL}/mfo/${mfoSlug}` },
  ]);
}
