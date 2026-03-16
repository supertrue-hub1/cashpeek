/**
 * SEO Utilities для генерации metadata
 * Переиспользуемые функции для всех страниц
 */

import type { Metadata } from 'next';

// Базовый URL сайта
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

// Сайт информация
export const SITE_INFO = {
  name: 'CashPeek',
  domain: 'cashpeek.ru',
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'support@cashpeek.ru',
  phone: process.env.NEXT_PUBLIC_SITE_PHONE,
} as const;

/**
 * Генерация canonical URL
 */
export function generateCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Генерация базовых metadata для страницы
 */
export function generatePageMetadata(params: {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}): Metadata {
  const {
    title,
    description,
    keywords,
    path = '',
    noIndex = false,
    ogImage,
    ogType = 'website',
    publishedTime,
    modifiedTime,
    author,
  } = params;

  const canonical = generateCanonicalUrl(path);
  const fullTitle = title.includes('CashPeek') || title.includes('cashpeek') 
    ? title 
    : `${title} | CashPeek`;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    authors: author ? [{ name: author }] : undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_INFO.name,
      locale: 'ru_RU',
      type: ogType,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      ...(ogType === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

/**
 * Генерация metadata для SEO-страницы (city + loanType)
 */
export function generateSeoPageMetadata(params: {
  h1: string;
  description: string;
  citySlug?: string;
  loanTypeSlug?: string;
  amount?: number;
  isFallback?: boolean;
  isEmpty?: boolean;
}): Metadata {
  const { h1, description, citySlug, loanTypeSlug, amount, isFallback, isEmpty } = params;
  
  // Формируем path
  const pathParts: string[] = [];
  if (loanTypeSlug) pathParts.push(loanTypeSlug);
  if (citySlug) pathParts.push(`v-${citySlug}`);
  
  const path = pathParts.length > 0 ? `/zaimy/${pathParts.join('/')}` : '/zaimy';
  
  // Модифицируем title для fallback
  let title = h1;
  if (isFallback && !isEmpty) {
    title = `${title} — альтернативные варианты`;
  }
  
  return generatePageMetadata({
    title,
    description,
    path,
    noIndex: isEmpty,
    keywords: generateSeoKeywords(params),
  });
}

/**
 * Генерация keywords для SEO-страницы
 */
function generateSeoKeywords(params: {
  citySlug?: string;
  loanTypeSlug?: string;
  amount?: number;
}): string[] {
  const keywords: string[] = ['займ', 'мфо', 'онлайн займ'];
  
  if (params.amount) {
    keywords.push(`займ ${params.amount} рублей`);
  }
  
  // Маппинг slug → keywords
  const loanTypeKeywords: Record<string, string[]> = {
    'na-kartu': ['займ на карту', 'займ на банковскую карту'],
    'bez-otkaza': ['займ без отказа', 'гарантированный займ'],
    'bez-proverki-ki': ['займ без проверки КИ', 'займ с плохой кредитной историей'],
    'bez-procentov': ['займ без процентов', 'займ под 0%'],
    'onlain': ['займ онлайн', 'онлайн займ на карту'],
    'kruglosutochno': ['круглосуточный займ', 'займ 24/7'],
    'dlya-pensionerov': ['займ пенсионерам', 'займ для пенсионеров'],
    'bez-raboty': ['займ безработным', 'займ без работы'],
    'studentam': ['займ студентам', 'займ для студентов'],
    'na-dlitelnyy-srok': ['долгосрочный займ', 'займ на длительный срок'],
  };
  
  if (params.loanTypeSlug && loanTypeKeywords[params.loanTypeSlug]) {
    keywords.push(...loanTypeKeywords[params.loanTypeSlug]);
  }
  
  return keywords;
}

/**
 * Генерация OG-изображения через API
 */
export function generateOgImageUrl(params: {
  title: string;
  subtitle?: string;
  type?: 'default' | 'blog' | 'offer' | 'city';
}): string {
  const { title, subtitle, type = 'default' } = params;
  
  // Используем наш API для генерации OG-изображений
  const searchParams = new URLSearchParams();
  searchParams.set('title', title.slice(0, 100));
  if (subtitle) searchParams.set('subtitle', subtitle.slice(0, 150));
  searchParams.set('type', type);
  
  return `${BASE_URL}/api/og?${searchParams.toString()}`;
}

/**
 * Генерация H1 для SEO-страницы
 */
export function generateSeoH1(params: {
  loanTypeName?: string;
  cityName?: string;
  cityPreposition?: string;
  amount?: number;
}): string {
  const { loanTypeName, cityName, cityPreposition, amount } = params;
  
  const parts: string[] = [];
  
  if (loanTypeName) {
    parts.push(loanTypeName);
  }
  
  if (cityPreposition) {
    parts.push(cityPreposition);
  } else if (cityName) {
    parts.push(`в ${cityName}`);
  }
  
  if (amount) {
    const formattedAmount = new Intl.NumberFormat('ru-RU').format(amount);
    parts.push(`на ${formattedAmount} ₽`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'Займы онлайн';
}

/**
 * Экспорт для использования в generateMetadata
 */
export type { Metadata };
