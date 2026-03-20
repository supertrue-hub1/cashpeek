/**
 * Расширенные мета-шаблоны с годом и CTA
 * Генерирует уникальные title/description для SEO-страниц
 */

import { 
  declineCity, 
  declineLoanType, 
  SEO_YEAR, 
  DEFAULT_CTA,
  CTA_PHRASES 
} from './declensions';

// ============================================
// Типы
// ============================================

export interface SeoPageParams {
  /** Тип займа (на карту, без процентов и т.д.) */
  loanType?: string;
  /** Название города */
  city?: string;
  /** Сумма займа */
  amount?: number;
  /** Срок займа в днях */
  term?: number;
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
}

// ============================================
// Утилиты форматирования
// ============================================

/** Форматирует сумму с пробелами */
function formatAmount(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

/** Форматирует срок в днях */
function formatTerm(days: number): string {
  if (days === 1) return '1 день';
  if (days >= 2 && days <= 4) return `${days} дня`;
  return `${days} дней`;
}

/** Выбирает случайный CTA */
function getRandomCta(): string {
  return CTA_PHRASES[Math.floor(Math.random() * CTA_PHRASES.length)];
}

// ============================================
// Шаблоны Title (60-70 символов)
// ============================================

const titleTemplates = {
  /** Тип + Город */
  typeAndCity: [
    '{TYPE_PREP} {CITY_PREP} — {YEAR} | {CTA}',
    '{TYPE} {CITY_PREP} — {YEAR} год',
    '{TYPE} в {CITY} — {YEAR}, {CTA}',
    '{TYPE_PREP} {CITY_GEN} — {YEAR}',
  ],
  /** Только тип */
  typeOnly: [
    '{TYPE} — {YEAR} | {CTA}',
    '{TYPE} — срочно, без отказа',
    '{TYPE} — лучшие МФО {YEAR}',
    '{TYPE} — онлайн за 5 минут',
  ],
  /** Тип + Сумма */
  typeAndAmount: [
    '{TYPE} до {AMOUNT}₽ — {YEAR}',
    '{TYPE} — до {AMOUNT}₽ {YEAR}',
    'Займ {TYPE} до {AMOUNT}₽ — {CTA}',
  ],
  /** Только город */
  cityOnly: [
    'Займы {CITY_PREP} — {YEAR} | {CTA}',
    'Займы в {CITY} — {YEAR} год',
    'Микрозаймы {CITY_PREP} — {CTA}',
  ],
  /** Главная */
  main: [
    'Займы онлайн — {YEAR}, {CTA}',
    'Срочные займы на карту — {YEAR}',
    'Лучшие займы {YEAR} — без отказа',
  ],
};

// ============================================
// Шаблоны Description (150-160 символов)
// ============================================

const descriptionTemplates = {
  typeAndCity: [
    '{TYPE_PREP} {CITY_PREP}. Первый займ под 0%. Более 50 МФО. Одобрение за 10 минут. Суммы до {MAX_AMOUNT}₽. {CTA}!',
    'Срочные займы {TYPE_PREP} {CITY_GEN}. Работаем круглосуточно. Без справок и проверок КИ. Деньги на карту за 5-15 минут.',
    '{TYPE} {CITY_PREP} — актуальные предложения {YEAR} года. Первый займ бесплатно. Выберите лучшее предложение!',
  ],
  typeOnly: [
    '{TYPE}. Первый займ под 0%. Более 50 проверенных МФО. Одобрение за 10 минут. Суммы до 50 000₽. {CTA}!',
    'Срочные займы {TYPE} онлайн. Работаем 24/7 без выходных. Без справок о доходах. Заявка за 3 минуты!',
    '{TYPE} — быстро, без отказа, круглосуточно. Более 50 МФО с одобрением 90%+. Выберите займ за 5 минут!',
  ],
  cityOnly: [
    'Займы {CITY_PREP}. Более 50 МФО. Первый займ под 0%. Одобрение за 10 минут. Суммы до 50 000₽. {CTA}!',
    'Микрозаймы {CITY_PREP} онлайн. Работаем круглосуточно. Без справок и проверок КИ. Деньги на карту за 15 минут.',
  ],
  typeAndAmount: [
    '{TYPE} на {AMOUNT}₽. Первый займ под 0%. Одобрение за 10 минут. Срок до {TERM}. {CTA}!',
    'Займ {TYPE} на сумму {AMOUNT}₽. Более 50 МФО. Быстрое одобрение. Деньги на карту за 5-15 минут.',
  ],
  main: [
    'Срочный займ на карту до 50 000₽ за 15 минут. Первый займ под 0%. Одобрение 90%+. {CTA}!',
    'Нужен займ? Помогаем получить деньги даже с плохой КИ. Без справок. Суммы до 50 000₽. {CTA}!',
    'Круглосуточные займы онлайн. Работаем 24/7. Ставка от 0%. Первый займ бесплатно. {CTA}!',
  ],
};

// ============================================
// Функции генерации
// ============================================

/**
 * Выбирает случайный элемент из массива
 */
function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Очищает текст и ограничивает длину
 */
function cleanText(text: string, maxLength: number): string {
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length > maxLength) {
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    cleaned = (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated).trim();
    
    if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
      cleaned += '...';
    }
  }
  
  return cleaned;
}

/**
 * Генерирует мета-данные для SEO-страницы
 * 
 * @param params - Параметры страницы
 * @param options - Дополнительные опции
 */
export function generateSeoMetadata(
  params: SeoPageParams,
  options: {
    /** Использовать случайный CTA (для кэширования лучше использовать конкретный) */
    randomCta?: boolean;
    /** Кастомный CTA */
    cta?: string;
    /** Переопределить год */
    year?: number;
  } = {}
): GeneratedMetadata {
  const { loanType, city, amount, term } = params;
  const { randomCta = false, cta, year = SEO_YEAR } = options;

  // Форматируем склонения
  const cityDeclined = city ? declineCity(city) : null;
  const typeDeclined = loanType ? declineLoanType(loanType) : null;

  // Выбираем CTA
  const ctaText = cta || (randomCta ? getRandomCta() : DEFAULT_CTA);

  // Значения по умолчанию
  const maxAmount = 50000;
  const defaultTerm = 30;

  // Переменные для подстановки
  const vars: Record<string, string> = {
    YEAR: String(year),
    CTA: ctaText,
    CITY: cityDeclined?.nominative || '',
    CITY_PREP: cityDeclined ? `в ${cityDeclined.prepositional}` : '',
    CITY_GEN: cityDeclined?.genitive || '',
    TYPE: typeDeclined?.nominative || '',
    TYPE_PREP: typeDeclined?.prepositional || '',
    TYPE_GEN: typeDeclined?.genitive || '',
    AMOUNT: amount ? formatAmount(amount) : '50 000',
    MAX_AMOUNT: formatAmount(maxAmount),
    TERM: term ? formatTerm(term) : formatTerm(defaultTerm),
  };

  // Выбираем шаблон на основе параметров
  let titleTemplate: string[];
  let descTemplate: string[];

  if (loanType && city) {
    titleTemplate = titleTemplates.typeAndCity;
    descTemplate = descriptionTemplates.typeAndCity;
  } else if (loanType && amount) {
    titleTemplate = titleTemplates.typeAndAmount;
    descTemplate = descriptionTemplates.typeAndAmount;
  } else if (loanType) {
    titleTemplate = titleTemplates.typeOnly;
    descTemplate = descriptionTemplates.typeOnly;
  } else if (city) {
    titleTemplate = titleTemplates.cityOnly;
    descTemplate = descriptionTemplates.cityOnly;
  } else {
    titleTemplate = titleTemplates.main;
    descTemplate = descriptionTemplates.main;
  }

  // Генерируем title
  let title = random(titleTemplate);
  for (const [key, value] of Object.entries(vars)) {
    title = title.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  title = cleanText(title, 70);

  // Генерируем description
  let description = random(descTemplate);
  for (const [key, value] of Object.entries(vars)) {
    description = description.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  description = cleanText(description, 160);

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
  };
}

/**
 * Генерирует canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
  
  // Убираем trailing slash
  let normalized = path.replace(/\/$/, '');
  // Убираем www
  normalized = normalized.replace(/^www\./, '');
  // Убираем все query параметры
  normalized = normalized.split('?')[0];
  // Убираем trailing slash после убирания query
  normalized = normalized.replace(/\/$/, '');
  
  return `${baseUrl}${normalized}`;
}

/**
 * Генерирует alternates для мета-данных Next.js
 */
export function generateAlternates(path: string) {
  const canonical = generateCanonicalUrl(path);
  
  return {
    canonical,
    languages: {
      'ru': canonical,
    },
  };
}
