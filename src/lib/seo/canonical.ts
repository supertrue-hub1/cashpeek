// Canonical URLs для предотвращения дублей
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#alternates

const BASE_URL = 'https://cashpeek.ru';

/**
 * Генерирует канонический URL для страницы
 * Убирает query params, trailing slash, www
 */
export function getCanonicalUrl(path: string): string {
  // Убираем trailing slash
  let normalized = path.replace(/\/$/, '');
  // Убираем www
  normalized = normalized.replace(/^www\./, '');
  
  return `${BASE_URL}${normalized}`;
}

/**
 * Правила канонизации для фильтрованных страниц
 * Параметры ?sort, ?page, ?ref не должны создавать дубли
 */
export function applyCanonicalRules(pathname: string): string {
  // Убираем все query параметры
  const cleanPath = pathname.split('?')[0];
  
  // Правила нормализации:
  
  // 1. /zaimy/na-kartu?sort=rating → /zaimy/na-kartu
  if (cleanPath.match(/^\/zaimy\/[^\/]+$/)) {
    return cleanPath;
  }
  
  // 2. /zaimy/na-kartu/v-moskva?page=2 → /zaimy/na-kartu/v-moskva
  if (cleanPath.match(/^\/zaimy\/[^\/]+\/v-[^\/]+$/)) {
    return cleanPath;
  }
  
  // 3. /zaimy/v-moskva?sort=popular → /zaimy/v-moskva
  if (cleanPath.match(/^\/zaimy\/v-[^\/]+$/)) {
    return cleanPath;
  }
  
  // 4. /mfo/zaimer?ref=sidebar → /mfo/zaimer
  if (cleanPath.match(/^\/mfo\/[^\/]+$/)) {
    return cleanPath;
  }
  
  // 5. /blog/kredity?page=2 → /blog/kredity
  if (cleanPath.match(/^\/blog\/[^\/]+$/)) {
    return cleanPath;
  }
  
  return cleanPath;
}

/**
 * Генерирует canonical metadata для страницы
 */
export function generateCanonicalMetadata(pathname: string) {
  const canonical = applyCanonicalRules(pathname);
  const fullUrl = `${BASE_URL}${canonical}`;
  
  return {
    alternates: {
      canonical: fullUrl,
      languages: {
        'ru': fullUrl,
      },
    },
  };
}

/**
 * Генерирует hreflang для многоязычности (для будущего расширения)
 */
export function generateHreflang(pathname: string) {
  const canonical = applyCanonicalRules(pathname);
  
  return {
    canonicalUrl: `${BASE_URL}${canonical}`,
    languages: {
      'ru': `${BASE_URL}${canonical}`,
      'x-default': `${BASE_URL}${canonical}`,
    },
  };
}

/**
 * Проверяет, является ли URL каноническим
 */
export function isCanonicalUrl(url: string): boolean {
  const withoutQuery = url.split('?')[0];
  const canonical = applyCanonicalRules(withoutQuery);
  return withoutQuery === canonical;
}
