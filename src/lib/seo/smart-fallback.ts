/**
 * Smart Fallback система для SEO-страниц
 * Каскадный поиск офферов: Exact → Fallback → Empty
 */

import { db } from '@/lib/db';
import type { LoanOffer } from '@prisma/client';

export interface SearchParams {
  city?: string;        // citySlug
  type?: string;        // loanTypeSlug (bez-otkaza, na-kartu, etc.)
  amount?: number;      // Сумма в рублях
  term?: number;        // Срок в днях
}

export interface FallbackResult {
  offers: LoanOffer[];
  isFallback: boolean;
  fallbackReason?: string;
  searchParams: {
    exact: {
      amountRange?: { min: number; max: number };
      termRange?: { min: number; max: number };
    };
    applied: {
      usedAmountFallback?: boolean;
      usedTermFallback?: boolean;
    };
  };
  isEmpty: boolean;
}

/**
 * Каскадный поиск офферов с Smart Fallback
 * 
 * Этап 1 (Exact Match): Строгий поиск по всем параметрам
 * Этап 2 (Fallback Match): Расширенный поиск по type + city
 * Этап 3 (Empty Content): Возврат пустого результата
 */
export async function getSeoPageOffers(params: SearchParams): Promise<FallbackResult> {
  const { city, type, amount, term } = params;
  
  // Базовый результат
  const result: FallbackResult = {
    offers: [],
    isFallback: false,
    searchParams: {
      exact: {},
      applied: {},
    },
    isEmpty: false,
  };
  
  // ============================================
  // ЭТАП 1: Exact Match (строгий поиск)
  // ============================================
  if (amount || term) {
    // Диапазоны для точного поиска
    const amountTolerance = 0.1; // ±10%
    const termTolerance = 5; // ±5 дней
    
    const amountMin = amount ? Math.floor(amount * (1 - amountTolerance)) : undefined;
    const amountMax = amount ? Math.ceil(amount * (1 + amountTolerance)) : undefined;
    const termMin = term ? term - termTolerance : undefined;
    const termMax = term ? term + termTolerance : undefined;
    
    result.searchParams.exact.amountRange = amountMin && amountMax 
      ? { min: amountMin, max: amountMax } 
      : undefined;
    result.searchParams.exact.termRange = termMin && termMax 
      ? { min: termMin, max: termMax } 
      : undefined;
    
    // Строим фильтр для Exact Match
    const exactWhere: any = {
      status: 'published',
      showOnHomepage: true,
    };
    
    // Фильтр по сумме (±10%)
    if (amountMin && amountMax) {
      exactWhere.AND = exactWhere.AND || [];
      exactWhere.AND.push({
        OR: [
          { minAmount: { lte: amountMax } },
          { maxAmount: { gte: amountMin } },
        ],
      });
    }
    
    // Фильтр по сроку (±5 дней)
    if (termMin && termMax) {
      exactWhere.AND = exactWhere.AND || [];
      exactWhere.AND.push({
        OR: [
          { minTerm: { lte: termMax } },
          { maxTerm: { gte: termMin } },
        ],
      });
    }
    
    // Фильтр по типу займа (через теги)
    if (type) {
      const tagMapping = getTagMapping(type);
      if (tagMapping.length > 0) {
        exactWhere.tags = {
          some: {
            tag: {
              slug: { in: tagMapping },
            },
          },
        };
      }
    }
    
    // Выполняем поиск
    try {
      const exactOffers = await db.loanOffer.findMany({
        where: exactWhere,
        orderBy: [
          { isFeatured: 'desc' },
          { rating: 'desc' },
          { approvalRate: 'desc' },
        ],
        take: 20,
        include: {
          tags: { include: { tag: true } },
        },
      });
      
      if (exactOffers.length > 0) {
        result.offers = exactOffers;
        return result;
      }
    } catch (error) {
      console.error('Exact match search failed:', error);
    }
  }
  
  // ============================================
  // ЭТАП 2: Fallback Match (расширенный поиск)
  // ============================================
  result.isFallback = true;
  result.fallbackReason = amount 
    ? `Не найдено точных совпадений на сумму ${amount.toLocaleString('ru-RU')} ₽`
    : 'Не найдено точных совпадений';
  
  const fallbackWhere: any = {
    status: 'published',
    showOnHomepage: true,
  };
  
  // Фильтр по типу займа (если есть)
  if (type) {
    const tagMapping = getTagMapping(type);
    if (tagMapping.length > 0) {
      fallbackWhere.tags = {
        some: {
          tag: {
            slug: { in: tagMapping },
          },
        },
      };
    }
  }
  
  // Игнорируем точные amount и term, но применяем мягкие фильтры
  if (amount) {
    result.searchParams.applied.usedAmountFallback = true;
    // Мягкий фильтр: показываем офферы, которые ХОТЯ БЫ МОГУТ выдать эту сумму
    fallbackWhere.minAmount = { lte: amount };
    fallbackWhere.maxAmount = { gte: Math.floor(amount * 0.5) }; // Хотя бы половина суммы
  }
  
  if (term) {
    result.searchParams.applied.usedTermFallback = true;
    // Мягкий фильтр: срок не критичен при fallback
  }
  
  try {
    const fallbackOffers = await db.loanOffer.findMany({
      where: fallbackWhere,
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { maxAmount: 'desc' }, // Показываем офферы с бОльшими суммами
      ],
      take: 20,
      include: {
        tags: { include: { tag: true } },
      },
    });
    
    result.offers = fallbackOffers;
  } catch (error) {
    console.error('Fallback match search failed:', error);
  }
  
  // ============================================
  // ЭТАП 3: Empty Content (нет офферов)
  // ============================================
  if (result.offers.length === 0) {
    result.isEmpty = true;
    result.isFallback = false; // Не fallback, а именно пустая страница
    result.fallbackReason = 'Офферы не найдены';
    
    // Последняя попытка: показать ВСЕ опубликованные офферы
    try {
      const anyOffers = await db.loanOffer.findMany({
        where: {
          status: 'published',
          showOnHomepage: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { rating: 'desc' },
        ],
        take: 10,
        include: {
          tags: { include: { tag: true } },
        },
      });
      
      if (anyOffers.length > 0) {
        result.offers = anyOffers;
        result.isFallback = true;
        result.fallbackReason = 'Показаны рекомендуемые предложения';
      }
    } catch (error) {
      console.error('Emergency fallback failed:', error);
    }
  }
  
  return result;
}

/**
 * Маппинг типов займов на теги
 */
function getTagMapping(loanTypeSlug: string): string[] {
  const mapping: Record<string, string[]> = {
    'bez-otkaza': ['bez-otkaza', 'no-refusal', 'high-approval'],
    'na-kartu': ['na-kartu', 'to-card', 'online-approval'],
    'bez-protsentov': ['bez-protsentov', 'zero-interest', 'first-loan-zero'],
    'bez-pasporta': ['bez-pasporta', 'no-passport', 'one-document'],
    'kruglosutochno': ['kruglosutochno', '24-7', 'round-the-clock'],
    's-plokhoy-kreditnoy-istoriey': ['bad-credit-ok', 'with-bad-credit'],
    'na-qiwi': ['na-qiwi', 'to-qiwi'],
    'na-yoomoney': ['na-yoomoney', 'to-yoomoney'],
    'na-kivi': ['na-qiwi', 'to-qiwi'],
    'na-karty': ['na-kartu', 'to-card'],
    'na-bezkontaktnuyu-kartu': ['na-kartu', 'to-card'],
    'na-imya-drugogo-cheloveka': ['na-kartu', 'to-card'],
    'bez-raboty': ['bez-raboty', 'no-job', 'bad-credit-ok'],
    'studentam': ['studentam', 'for-students'],
    'pensioneram': ['pensioneram', 'for-pensioners'],
    's-18-let': ['s-18-let', 'from-18'],
    'bez-skrytykh-platezhey': ['no-hidden-fees', 'transparent'],
    's-dosrochnym-pogasheniem': ['early-repayment', 'prolongation'],
    's-prolongatsiey': ['prolongation', 'extension'],
    's-loyalnoy-stavkoy': ['loyalty-program', 'low-rate'],
  };
  
  return mapping[loanTypeSlug] || [];
}

/**
 * Генерация редакторского контента для fallback-страниц
 * Отвечает на вопрос: "Почему на данную сумму мало предложений?"
 */
export function generateFallbackExplanation(params: {
  amount?: number;
  city?: string;
  cityName?: string;
  offersCount: number;
}): string {
  const { amount, city, cityName, offersCount } = params;
  
  // Шаблоны объяснений
  const templates = {
    lowAmount: [
      `Небольшие суммы до ${amount?.toLocaleString('ru-RU')} ₽ доступны в большинстве МФО. `,
      `Микрозаймы на сумму ${amount?.toLocaleString('ru-RU')} ₽ — самый востребованный продукт. `,
      `МФО охотно выдают займы до ${amount?.toLocaleString('ru-RU')} ₽ новым клиентам. `,
    ],
    mediumAmount: [
      `Займы на сумму ${amount?.toLocaleString('ru-RU')} ₽ требуют более тщательной проверки. `,
      `Для получения ${amount?.toLocaleString('ru-RU')} ₽ может потребоваться подтверждение дохода. `,
      `МФО рассматривают заявки на ${amount?.toLocaleString('ru-RU')} ₽ индивидуально. `,
    ],
    highAmount: [
      `Крупные займы от ${amount?.toLocaleString('ru-RU')} ₽ доступны постоянным клиентам. `,
      `Для суммы ${amount?.toLocaleString('ru-RU')} ₽ рекомендуем оформить займ в несколько этапов. `,
      `МФО редко выдают более ${(amount || 0 * 0.7).toLocaleString('ru-RU')} ₽ новым клиентам. `,
    ],
    cityContext: [
      `В ${cityName} работает ${offersCount} проверенных МФО. `,
      `Жители ${cityName} могут получить деньги на карту за 15 минут. `,
      `${cityName} — крупный город с развитой сетью микрофинансовых организаций. `,
    ],
    general: [
      'Мы подобрали лучшие альтернативные варианты для вашей заявки. ',
      'Рекомендуем рассмотреть предложения с гибкими условиями. ',
      'Указанные МФО имеют высокий процент одобрения. ',
    ],
  };
  
  // Выбираем шаблон в зависимости от суммы
  let explanation = '';
  
  if (amount) {
    if (amount <= 5000) {
      explanation += randomChoice(templates.lowAmount);
    } else if (amount <= 15000) {
      explanation += randomChoice(templates.mediumAmount);
    } else {
      explanation += randomChoice(templates.highAmount);
    }
  }
  
  if (cityName) {
    explanation += randomChoice(templates.cityContext);
  }
  
  explanation += randomChoice(templates.general);
  
  return explanation;
}

/**
 * Генерация SEO-метаданных для fallback-страниц
 */
export function generateFallbackMetadata(params: {
  amount?: number;
  cityName?: string;
  loanTypeName?: string;
  isFallback: boolean;
  isEmpty: boolean;
}): {
  titleSuffix: string;
  descriptionSuffix: string;
  noIndex: boolean;
} {
  const { amount, cityName, loanTypeName, isFallback, isEmpty } = params;
  
  // Для пустых страниц — noindex
  if (isEmpty) {
    return {
      titleSuffix: ' — альтернативные варианты',
      descriptionSuffix: ' Подобраны альтернативные предложения.',
      noIndex: true,
    };
  }
  
  // Для fallback — меняем title/description
  if (isFallback) {
    const parts: string[] = [];
    
    if (amount) {
      parts.push(`на сумму до ${(amount * 1.5).toLocaleString('ru-RU')} ₽`);
    }
    
    return {
      titleSuffix: ' — альтернативные варианты' + (parts.length ? ` (${parts.join(', ')})` : ''),
      descriptionSuffix: ' Показаны альтернативные предложения с высоким процентом одобрения.',
      noIndex: false, // Fallback-страницы индексируем
    };
  }
  
  return {
    titleSuffix: '',
    descriptionSuffix: '',
    noIndex: false,
  };
}

/**
 * Вспомогательная функция: случайный выбор из массива
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
