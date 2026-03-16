// SEO утилиты для генерации мета-данных и canonical URLs

import { Metadata } from 'next';
import { LOAN_CATEGORIES, CITIES, AMOUNTS, type LoanCategorySlug, type CitySlug } from './slugs';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

// Параметры, которые не влияют на контент (не для индексации)
const NO_INDEX_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'sort', 'view', 'source'];

// Генерация canonical URL
export function generateCanonicalUrl(pathname: string, searchParams?: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && !NO_INDEX_PARAMS.includes(key)) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
  }
  
  const queryString = params.toString();
  return `${BASE_URL}${pathname}${queryString ? `?${queryString}` : ''}`;
}

// Генерация мета-тегов для категории займов
export function generateCategoryMetadata(
  categorySlug: LoanCategorySlug,
  citySlug?: CitySlug
): Metadata {
  const category = LOAN_CATEGORIES[categorySlug];
  
  if (!category) {
    return { title: 'Категория не найдена' };
  }
  
  let title: string;
  let description: string;
  let canonical: string;
  
  if (citySlug) {
    const city = CITIES[citySlug];
    title = `${category.name} ${city.preposition} — ${category.shortDesc}`;
    description = `Займы ${category.namePrepositional} ${city.preposition}. ${category.description} Доступно в ${city.name}.`;
    canonical = `${BASE_URL}/zaimy/${categorySlug}/v-${citySlug}`;
  } else {
    title = `${category.name} — ${category.shortDesc}`;
    description = category.description;
    canonical = `${BASE_URL}/zaimy/${categorySlug}`;
  }
  
  // Дополнительные keywords
  const keywords = [
    ...category.keywords,
    citySlug ? `${category.namePrepositional} ${CITIES[citySlug].name}` : null,
  ].filter(Boolean).join(', ');
  
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
    },
  };
}

// Генерация мета-тегов для страницы города
export function generateCityMetadata(citySlug: CitySlug): Metadata {
  const city = CITIES[citySlug];
  
  if (!city) {
    return { title: 'Город не найден' };
  }
  
  const title = `Займы ${city.preposition} — онлайн займы на карту`;
  const description = `Лучшие займы ${city.preposition}. Сравните ${Object.keys(LOAN_CATEGORIES).length} категорий займов от проверенных МФО. Мгновенное зачисление на карту.`;
  const canonical = `${BASE_URL}/zaimy/v-${citySlug}`;
  
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
    },
  };
}

// Генерация мета-тегов для страницы суммы
export function generateAmountMetadata(amountSlug: string): Metadata {
  const amount = AMOUNTS.find(a => a.slug === amountSlug);
  
  if (!amount) {
    return { title: 'Сумма не найдена' };
  }
  
  const title = `Займы ${amount.display} — срочно на карту`;
  const description = `Получите займ ${amount.title.toLowerCase()} на любые нужды. Быстрое оформление, мгновенное зачисление. Без справок и поручителей.`;
  const canonical = `${BASE_URL}/zaimy/do-${amountSlug}-rublei`;
  
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
    },
  };
}

// Генерация мета-тегов для страницы МФО
export function generateMfoMetadata(
  name: string,
  description?: string,
  logo?: string
): Metadata {
  const title = `${name} — официальный сайт, условия займов и отзывы`;
  const desc = description || `Взять займ в ${name}. Актуальные условия, процентные ставки, онлайн-заявка. Отзывы клиентов и рейтинг МФО.`;
  const canonical = `${BASE_URL}/mfo/${name.toLowerCase().replace(/\s+/g, '-')}`;
  
  return {
    title,
    description: desc,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: canonical,
      images: logo ? [{ url: logo }] : undefined,
    },
  };
}

// Генерация breadcrumb для JSON-LD
export function generateBreadcrumb(items: { name: string; url: string }[]): object {
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

// Проверка: нужно ли индексировать страницу
export function shouldIndex(searchParams: Record<string, string | string[] | undefined>): boolean {
  // Проверяем запрещённые параметры
  for (const param of NO_INDEX_PARAMS) {
    if (searchParams[param]) {
      return false;
    }
  }
  return true;
}
