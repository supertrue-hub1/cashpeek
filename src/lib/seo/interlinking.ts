/**
 * Генераторы ссылок для внутренней перелинковки
 * Серверные функции для SEO-страниц
 */

export interface ContextualLink {
  title: string;
  href: string;
  description?: string;
  badge?: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
  icon?: 'map' | 'card' | 'clock' | 'money';
}

// Категории займов
const LOAN_CATEGORIES: Record<string, { name: string; slug: string; desc: string }> = {
  'na-kartu': { name: 'На карту', slug: 'na-kartu', desc: 'Мгновенное зачисление' },
  'bez-otkaza': { name: 'Без отказа', slug: 'bez-otkaza', desc: '97% одобрение' },
  'bez-proverki-ki': { name: 'Без проверки КИ', slug: 'bez-proverki-ki', desc: 'Без запроса в БКИ' },
  'bez-procentov': { name: 'Под 0%', slug: 'bez-procentov', desc: 'Первый займ бесплатно' },
  'kruglosutochno': { name: 'Круглосуточно', slug: 'kruglosutochno', desc: '24/7' },
  'onlain': { name: 'Онлайн', slug: 'onlain', desc: 'Без визита в офис' },
};

// Города
const CITIES: Record<string, { name: string; slug: string }> = {
  'moskva': { name: 'Москва', slug: 'moskva' },
  'sankt-peterburg': { name: 'Санкт-Петербург', slug: 'sankt-peterburg' },
  'novosibirsk': { name: 'Новосибирск', slug: 'novosibirsk' },
  'ekaterinburg': { name: 'Екатеринбург', slug: 'ekaterinburg' },
  'kazan': { name: 'Казань', slug: 'kazan' },
  'nizhniy-novgorod': { name: 'Нижний Новгород', slug: 'nizhniy-novgorod' },
};

/**
 * Генерирует ссылки на связанные категории
 */
export function generateRelatedCategoryLinks(
  currentCategorySlug: string,
  citySlug?: string
): ContextualLink[] {
  return Object.entries(LOAN_CATEGORIES)
    .filter(([slug]) => slug !== currentCategorySlug)
    .slice(0, 4)
    .map(([, cat]) => ({
      title: `Займы ${cat.name}`,
      href: citySlug ? `/zaimy/${cat.slug}/v-${citySlug}` : `/zaimy/${cat.slug}`,
      description: cat.desc,
    }));
}

/**
 * Генерирует ссылки на соседние города
 */
export function generateRelatedCityLinks(
  currentCitySlug: string,
  categorySlug?: string
): ContextualLink[] {
  return Object.entries(CITIES)
    .filter(([slug]) => slug !== currentCitySlug)
    .slice(0, 4)
    .map(([, city]) => ({
      title: categorySlug ? `Займы в ${city.name}` : city.name,
      href: categorySlug 
        ? `/zaimy/${categorySlug}/v-${city.slug}` 
        : `/zaimy/v-${city.slug}`,
      description: `МФО в ${city.name}`,
    }));
}

/**
 * Генерирует ссылки для футера
 */
export function generateFooterLinks(citySlug?: string, loanTypeSlug?: string): FooterLinkItem[] {
  const links: FooterLinkItem[] = [];
  
  if (citySlug) {
    links.push(
      { label: 'Все виды займов', href: `/zaimy/v-${citySlug}`, icon: 'card' },
    );
  }
  
  if (loanTypeSlug) {
    links.push(
      { label: 'Во всех городах', href: `/zaimy/${loanTypeSlug}`, icon: 'map' },
    );
  }
  
  links.push(
    { label: 'Все МФО', href: '/mfo', icon: 'card' },
    { label: 'Сравнить займы', href: '/sravnit', icon: 'money' },
  );
  
  return links;
}
