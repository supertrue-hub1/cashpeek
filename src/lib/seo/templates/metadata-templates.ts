/**
 * SEO Templates Configuration
 * Генерация мета-тегов для страниц МФО и категорий
 * 
 * Переменные для подстановки:
 * - {BRAND} — название МФО
 * - {CITY} — город (кириллица)
 * - {TYPE} — тип займа
 * - {AMOUNT} — сумма займа
 * - {TERM} — срок займа
 */

import type { LoanOffer } from '@prisma/client';

// ============================================
// Типы данных
// ============================================

export interface OfferInput {
  name: string;
  slug: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate?: number | null;
  psk?: number | null;
  decisionTime: number;
  approvalRate: number;
  customDescription?: string | null;
}

export interface CategoryContext {
  city?: string;
  cityPreposition?: string; // "в Москве", "в Санкт-Петербурге"
  type?: string;
  typePreposition?: string; // "на карту", "без отказа"
  amount?: number;
  term?: number;
}

export interface MetadataResult {
  title: string;
  description: string;
}

// ============================================
// Утилиты
// ============================================

/** Очистка и лимит текста */
function cleanText(text: string, maxLength: number): string {
  // Удаляем двойные пробелы
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Если превышает лимит — обрезаем по последнему слову перед лимитом
  if (cleaned.length > maxLength) {
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    cleaned = (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated).trim();
    
    // Добавляем троеточие если было обрезано
    if (!cleaned.endsWith('...') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
      cleaned += '...';
    }
  }
  
  return cleaned;
}

/** Форматирование суммы */
function formatAmount(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

/** Форматирование срока */
function formatTerm(days: number): string {
  if (days === 1) return '1 день';
  if (days >= 2 && days <= 4) return `${days} дня`;
  if (days >= 5 && days <= 21) return `${days} дней`;
  if (days >= 22 && days <= 24) return '22-24 дня';
  if (days >= 25 && days <= 29) return `${days} дней`;
  if (days === 30) return '1 месяц';
  if (days > 30) return `до ${days} дней`;
  return `${days} дней`;
}

/** Подстановка переменных */
function replaceVariables(
  template: string,
  vars: Record<string, string | number | undefined>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
  }
  
  // Удаляем нераскрытые переменные
  result = result.replace(/\{[A-Z_]+\}/g, '');
  
  // Удаляем двойные пробелы
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

/** Выбор случайного элемента из массива */
function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Разбиение Description на предложения */
function parseDescriptionTemplate(template: string): string[] {
  return template.split('|');
}

// ============================================
// Шаблоны Title (50-60 символов)
// ============================================

const titleTemplates = {
  /** Заголовок для оффера */
  offer: [
    '{BRAND}: займ до {AMOUNT} руб. на {TERM} — онлайн за 5 минут',
    'Займ в {BRAND} — до {AMOUNT} руб. под {RATE}% в день',
    '{BRAND} — срочный займ {TYPE} {CITY}',
    '{BRAND}: первый займ под 0% до {AMOUNT} руб.',
    '{BRAND}: займ на карту {TYPE} за {MINUTES} минут',
  ],
  
  /** Заголовок для категории */
  category: [
    'Займы {TYPE} {CITY} — онлайн, на карту, за 15 минут',
    '{TYPE} {CITY} — займы до {AMOUNT} руб. без отказа',
    'Срочные займы {TYPE} {CITY} с плохой КИ',
    '{TYPE} в {CITY} — 50+ МФО, одобрение за 10 минут',
    'Займы {TYPE} онлайн {CITY} — 0% первый займ!',
  ],
  
  /** Городской заголовок */
  city: [
    'Займы в {CITY} — онлайн на карту за 5 минут',
    'Займы на карту {CITY} — 0% первый займ!',
    'Где взять займ {CITY}? Лучшие предложения МФО',
    'Срочные займы {CITY} — деньги за 15 минут',
  ],
  
  /** Типовой заголовок */
  type: [
    'Займы {TYPE} — онлайн, срочно, без отказа',
    '{TYPE} — займы на карту за 15 минут',
    'Лучшие {TYPE} с моментальным одобрением',
    'Срочные займы {TYPE} — деньги за 5 минут',
  ],
  
  /** Главный заголовок */
  main: [
    'Займы онлайн на карту за 5 минут — до 50 000 руб.',
    'Срочные займы онлайн — первый под 0%!',
    'Лучшие займы на карту — одобрение за 10 минут',
  ],
};

// ============================================
// Шаблоны Description (140-160 символов, 3 предложения)
// ============================================

const descriptionTemplates = {
  /** Описание для оффера */
  offer: [
    // Вариант 1
    'Займ в {BRAND}: сумма до {AMOUNT} руб., срок {TERM}. Ставка от {RATE}% в день. Решение за {MINUTES} минут.|{FIRST_LOAN_BONUS}Лимит до {MAX_AMOUNT} руб. Одобрение {APPROVAL}% заявок. Выдача на карту.|Подайте заявку онлайн и получите деньги сразу после одобрения!',
    
    // Вариант 2
    '{BRAND} — быстрый займ {TYPE}. Суммы от {MIN_AMOUNT} до {AMOUNT} руб. на срок {TERM}.|Ставка {RATE}% в день. Первый займ {FIRST_LOAN_TEXT}. {BAD_CREDIT_TEXT}|Заявка на займ — онлайн за 3 минуты. Деньги переведём за {MINUTES} минут!',
    
    // Вариант 3
    'Оформите займ в {BRAND} — надёжной МФО. Сумма до {AMOUNT} руб. на {TERM}.|{PSK_TEXT}Одобрение {APPROVAL}%. Без звонков и проверок. Деньги на любую банковскую карту.|Заполните заявку на сайте и получите решение за {MINUTES} минут!',
  ],
  
  /** Описание для категории */
  category: [
    'Займы {TYPE} {CITY_PREP} — более 50 проверенных МФО. Суммы до {AMOUNT} руб. Первый займ под 0%!|Одобрение за 10 минут. Работаем круглосуточно. Без справок и проверок КИ.|Выбирайте лучшие предложения и оформляйте займ онлайн прямо сейчас!',
    
    '{TYPE} {CITY_PREP}: срочные займы на карту за 5-15 минут. Без отказа и скрытых комиссий.|Суммы от {MIN_AMOUNT} до {AMOUNT} руб. Срок {TERM}. Первый займ бесплатно.|Оформите заявку за 2 минуты и получите деньги мгновенно на карту!',
    
    'Лучшие займы {TYPE} {CITY_PREP} — актуальные предложения от 50+ МФО. Онлайн-оформление за 5 минут.|Первый займ под 0%. Повторные — от 0.8% в день. Одобрение 90%+.|Сравните предложения и выберите займ с самыми выгодными условиями!',
  ],
  
  /** Описание для города */
  city: [
    'Займы в {CITY} — онлайн на карту за 15 минут. Более 50 МФО с одобрением 90%+. Первый займ под 0%!|Суммы от 1 000 до 50 000 руб. Срок от 1 до 30 дней. Без справок и поручителей.|Оформите заявку онлайн и получите деньги на карту в день обращения!',
    
    'Где взять займ в {CITY}? Сравните предложения 50+ МФО и выберите лучшее. Срочно, без отказа, 24/7.|Первый займ бесплатно! Повторные — от 0.8% в день. Рассмотрение за 2-10 минут.|Заполните заявку на сайте и получите деньги на карту за 15 минут!',
  ],
  
  /** Описание для типа */
  type: [
    '{TYPE} — срочные займы онлайн на карту за 5-15 минут. Первый займ под 0%!|Более 50 МФО. Суммы до 50 000 руб. Срок до 30 дней. Одобрение 90%+.|Оформите займ онлайн и получите деньги мгновенно! Без проверок и справок.',
    
    'Займы {TYPE}: быстро, без отказа, круглосуточно. Только паспорт, никаких проверок.|Лимит до {AMOUNT} руб. Первый займ бесплатно. Повторные — от 0.8% в день.|Заполните заявку за 3 минуты и получите деньги на карту сразу после одобрения!',
  ],
  
  /** Главное описание */
  main: [
    'Срочный займ на карту до {AMOUNT} рублей за {MINUTES} минут. Ответим на заявку сразу после подачи.|Первый займ под 0% — получаете деньги без переплат! Лимит до {MAX_AMOUNT} руб. на срок до {TERM}.|Оформите заявку онлайн и получите деньги на карту прямо сейчас!',
    
    'Нужен займ? Помогаем получить деньги даже с плохой кредитной историей и безработным. Без справок.|Одобрение 90%+ заявок. Суммы от {MIN_AMOUNT} до {AMOUNT} руб. на срок {TERM}.|Заполните заявку за 3 минуты и получите деньги на карту уже через 15 минут!',
    
    'Круглосуточные займы онлайн — работаем 24/7 без выходных. Деньги на любую банковскую карту.|Ставка от {MIN_RATE}% в день. Первый займ под 0% для новых клиентов. Суммы до {AMOUNT} руб.|Подайте заявку сейчас и получите деньги мгновенно! Никаких скрытых комиссий.',
    
    'Займы без проверки кредитной истории и звонков работодателю. Только паспорт и 5 минут времени.|Выдаем деньги даже с просрочками и долгами. Суммы до {AMOUNT} руб. Срок {TERM}.|Оформите займ онлайн — решение придет в СМС через 3 минуты!',
    
    'Займы на карту любого банка РФ — моментальный перевод после одобрения. Visa, MasterCard, МИР.|Первый займ под 0%! Повторные — от {MIN_RATE}% в день. Лимит до {AMOUNT} руб.|Заполните заявку за 2 минуты и получите деньги на карту за 5 минут!',
  ],
};

// ============================================
// Функции генерации
// ============================================

/**
 * Генерация мета-данных для оффера (МФО)
 * @param offer - Данные оффера из базы
 * @param context - Дополнительный контекст (город, тип)
 */
export function generateOfferMetadata(
  offer: OfferInput, 
  context?: Partial<CategoryContext>
): MetadataResult {
  const {
    name,
    minAmount,
    maxAmount,
    minTerm,
    maxTerm,
    baseRate,
    firstLoanRate,
    psk,
    decisionTime,
    approvalRate,
  } = offer;

  // Форматированные значения
  const amount = maxAmount || 30000;
  const minAm = minAmount || 1000;
  const maxAm = maxAmount || 50000;
  const term = formatTerm(maxTerm || 30);
  const termShort = formatTerm(minTerm || 7);
  const minutes = decisionTime === 0 ? '5' : String(decisionTime);
  const rate = baseRate || 0.8;
  const minRate = Math.max(0.1, (baseRate || 0.8) - 0.2);
  
  // Выгода для первого займа
  const firstLoanBonus = firstLoanRate === 0 
    ? 'Первый займ под 0% — без переплат! ' 
    : `Первый займ — ${firstLoanRate || 0}% в день. `;
  const firstLoanText = firstLoanRate === 0 
    ? 'под 0%' 
    : `от ${firstLoanRate || 0}% в день`;
  
  // Текст про плохую КИ
  const badCreditText = 'Работаем с плохой КИ. ';
  
  // Текст про ПСК
  const pskText = psk 
    ? `ПСК ${psk}% годовых. ` 
    : '';
  
  // Город и тип
  const city = context?.city || '';
  const cityPrep = context?.cityPreposition || (city ? `в ${city}` : '');
  const type = context?.type || 'на карту';
  
  // Переменные для подстановки
  const vars: Record<string, string | number | undefined> = {
    BRAND: name,
    AMOUNT: formatAmount(amount),
    MIN_AMOUNT: formatAmount(minAm),
    MAX_AMOUNT: formatAmount(maxAm),
    TERM: term,
    TERM_SHORT: termShort,
    RATE: rate.toFixed(1),
    MIN_RATE: minRate.toFixed(1),
    MINUTES: minutes,
    APPROVAL: approvalRate || 90,
    CITY: city,
    CITY_PREP: cityPrep,
    TYPE: type,
    FIRST_LOAN_BONUS: firstLoanBonus,
    FIRST_LOAN_TEXT: firstLoanText,
    BAD_CREDIT_TEXT: badCreditText,
    PSK_TEXT: pskText,
  };

  // Выбираем случайный шаблон
  const titleTemplate = random(titleTemplates.offer);
  const descTemplate = random(descriptionTemplates.offer);
  
  // Генерируем Title
  let title = replaceVariables(titleTemplate, vars);
  title = cleanText(title, 60);
  
  // Генерируем Description (3 предложения)
  const descParts = parseDescriptionTemplate(descTemplate);
  const description = descParts
    .map(part => replaceVariables(part.trim(), vars))
    .join(' ');
  
  const finalDescription = cleanText(description, 160);

  return {
    title,
    description: finalDescription,
  };
}

/**
 * Генерация мета-данных для категорийной страницы
 * @param city - Название города (опционально)
 * @param type - Тип займа (опционально)
 */
export function generateCategoryMetadata(
  city?: string, 
  type?: string
): MetadataResult {
  // Форматирование
  const cityPrep = city ? `в ${city}` : '';
  const cityName = city || '';
  const typeName = type || 'на карту';
  
  const vars: Record<string, string | number | undefined> = {
    CITY: cityName,
    CITY_PREP: cityPrep,
    TYPE: typeName,
    AMOUNT: '50 000',
    MIN_AMOUNT: '1 000',
    TERM: '30 дней',
    MINUTES: '15',
    MIN_RATE: '0.8',
    APPROVAL: '90',
  };

  // Выбираем шаблон в зависимости от контекста
  let titleTemplate: string;
  let descTemplate: string;
  
  if (city && type) {
    // Город + тип
    titleTemplate = random(titleTemplates.category);
    descTemplate = random(descriptionTemplates.category);
  } else if (city) {
    // Только город
    titleTemplate = random(titleTemplates.city);
    descTemplate = random(descriptionTemplates.city);
  } else if (type) {
    // Только тип
    titleTemplate = random(titleTemplates.type);
    descTemplate = random(descriptionTemplates.type);
  } else {
    // Главная
    titleTemplate = random(titleTemplates.main);
    descTemplate = random(descriptionTemplates.main);
  }

  // Генерируем Title
  let title = replaceVariables(titleTemplate, vars);
  title = cleanText(title, 60);
  
  // Генерируем Description
  const descParts = parseDescriptionTemplate(descTemplate);
  const description = descParts
    .map(part => replaceVariables(part.trim(), vars))
    .join(' ');
  
  const finalDescription = cleanText(description, 160);

  return {
    title,
    description: finalDescription,
  };
}

/**
 * Генерация мета-данных для SEO-страницы (программные страницы)
 */
export function generateSeoPageMetadata(params: {
  city?: string;
  loanType?: string;
  amount?: number;
  term?: number;
}): MetadataResult {
  const { city, loanType, amount, term } = params;
  
  const cityPrep = city ? `в ${city}` : '';
  const amountStr = amount ? formatAmount(amount) : '50 000';
  const termStr = term ? formatTerm(term) : '30 дней';
  
  const vars: Record<string, string | number | undefined> = {
    CITY: city || '',
    CITY_PREP: cityPrep,
    TYPE: loanType || 'на карту',
    AMOUNT: amountStr,
    MIN_AMOUNT: amount ? formatAmount(Math.floor(amount * 0.1)) : '1 000',
    TERM: termStr,
    MINUTES: '15',
    MIN_RATE: '0.8',
    APPROVAL: '90',
  };

  // Шаблон для SEO-страниц
  const titleTemplate = city && loanType
    ? `Займы ${loanType} ${cityPrep} — до ${amountStr} руб. за 15 минут`
    : city
    ? `Займы ${cityPrep} — онлайн на карту за 5 минут`
    : loanType
    ? `Займы ${loanType} — срочно, без отказа, 24/7`
    : 'Займы онлайн на карту за 5 минут — до 50 000 руб.';
    
  const descTemplate = city && loanType
    ? `Срочные займы ${loanType} ${cityPrep}. Более 50 МФО. Суммы до ${amountStr} руб. Первый займ под 0%!|Одобрение за 10 минут. Без справок и проверок КИ.|Выбирайте лучшие предложения и оформляйте займ онлайн!`
    : city
    ? `Займы ${cityPrep} — онлайн на карту за 15 минут. 50+ МФО с одобрением 90%+. Первый займ под 0%!|Суммы от 1 000 до 50 000 руб. Срок до 30 дней. Без справок.|Оформите заявку онлайн и получите деньги на карту в день обращения!`
    : loanType
    ? `${loanType} — срочные займы онлайн на карту за 5-15 минут. Первый займ под 0%!|Более 50 МФО. Суммы до 50 000 руб. Срок до 30 дней. Одобрение 90%+.|Оформите займ онлайн и получите деньги мгновенно!`
    : `Срочный займ на карту до 50 000 рублей за 15 минут. Первый займ под 0%!|Одобрение 90%+ заявок. Работаем круглосуточно. Без справок и поручителей.|Оформите заявку онлайн и получите деньги на карту прямо сейчас!`;

  let title = replaceVariables(titleTemplate, vars);
  title = cleanText(title, 60);
  
  const descParts = parseDescriptionTemplate(descTemplate);
  const description = descParts
    .map(part => replaceVariables(part.trim(), vars))
    .join(' ');
  
  const finalDescription = cleanText(description, 160);

  return {
    title,
    description: finalDescription,
  };
}

// ============================================
// Конфиг для экспорта
// ============================================

export const seoTemplates = {
  /** Генерация мета-данных для оффера */
  generateOfferMetadata,
  
  /** Генерация мета-данных для категории */
  generateCategoryMetadata,
  
  /** Генерация мета-данных для SEO-страницы */
  generateSeoPageMetadata,
};

export default seoTemplates;
