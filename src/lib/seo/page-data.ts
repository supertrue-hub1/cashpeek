/**
 * SEO Page Data Fetcher
 * Оптимизированные функции для получения данных SEO-страниц
 * С кэшированием и пагинацией
 */

import { db } from '@/lib/db';
import { cache } from 'react';

export interface OfferForSeo {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate: number | null;
  decisionTime: number;
  approvalRate: number;
  isFeatured: boolean;
  isNew: boolean;
  affiliateUrl: string;
}

export interface CrossLinkData {
  city?: string;
  citySlug?: string;
  loanType?: string;
  loanTypeSlug?: string;
  offersCount?: number;
  priority?: number;
}

// ============================================
// Кэшированные запросы (60 секунд)
// ============================================

/**
 * Кэшированное получение офферов для SEO-страницы
 * Оптимизировано с take: 10 для минимизации нагрузки
 */
export const getOffersForSeoPage = cache(async (amount: number): Promise<OfferForSeo[]> => {
  const minAmount = Math.max(0, amount - 10000);
  const maxAmount = amount + 50000;

  return db.loanOffer.findMany({
    where: {
      status: 'published',
      minAmount: { lte: maxAmount },
      maxAmount: { gte: minAmount },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      rating: true,
      minAmount: true,
      maxAmount: true,
      minTerm: true,
      maxTerm: true,
      baseRate: true,
      firstLoanRate: true,
      decisionTime: true,
      approvalRate: true,
      isFeatured: true,
      isNew: true,
      affiliateUrl: true,
    },
    orderBy: [
      { isFeatured: 'desc' },
      { rating: 'desc' },
    ],
    take: 10, // Ограничиваем 10 офферами
  });
});

/**
 * Получает количество офферов для заданной суммы
 */
export const getOffersCountForSeoPage = cache(async (amount: number): Promise<number> => {
  const minAmount = Math.max(0, amount - 10000);
  const maxAmount = amount + 50000;

  return db.loanOffer.count({
    where: {
      status: 'published',
      minAmount: { lte: maxAmount },
      maxAmount: { gte: minAmount },
    },
  });
});

/**
 * Кэшированное получение связанных типов займов
 */
export const getRelatedLoanTypes = cache(async (
  citySlug: string, 
  currentType: string,
  limit: number = 10
): Promise<CrossLinkData[]> => {
  const types = await db.seoCombination.findMany({
    where: {
      citySlug,
      loanTypeSlug: { not: currentType },
      isIndexable: true,
      noIndex: false,
      status: 'published',
    },
    select: {
      loanType: true,
      loanTypeSlug: true,
      priority: true,
    },
    distinct: ['loanTypeSlug'],
    orderBy: [
      { priority: 'desc' },
      { viewsCount: 'desc' },
    ],
    take: limit,
  });

  // Добавляем количество офферов для каждого типа
  const typesWithCounts = await Promise.all(
    types.map(async (type) => {
      const offersCount = await db.loanOffer.count({
        where: { status: 'published' },
      });
      return {
        loanType: type.loanType,
        loanTypeSlug: type.loanTypeSlug,
        offersCount,
        priority: type.priority,
      };
    })
  );

  return typesWithCounts;
});

/**
 * Кэшированное получение связанных городов
 */
export const getRelatedCities = cache(async (
  currentCity: string,
  typeSlug: string,
  limit: number = 10
): Promise<CrossLinkData[]> => {
  const cities = await db.seoCombination.findMany({
    where: {
      citySlug: { not: currentCity },
      loanTypeSlug: typeSlug,
      isIndexable: true,
      noIndex: false,
      status: 'published',
    },
    select: {
      city: true,
      citySlug: true,
      priority: true,
    },
    distinct: ['citySlug'],
    orderBy: [
      { priority: 'desc' },
      { viewsCount: 'desc' },
    ],
    take: limit,
  });

  // Добавляем количество офферов для каждого города
  const citiesWithCounts = await Promise.all(
    cities.map(async (city) => {
      const offersCount = await db.seoCombination.count({
        where: {
          citySlug: city.citySlug,
          loanTypeSlug: typeSlug,
          status: 'published',
        },
      });
      return {
        city: city.city,
        citySlug: city.citySlug,
        offersCount,
        priority: city.priority,
      };
    })
  );

  return citiesWithCounts;
});

/**
 * Получает все популярные города для перелинковки
 */
export const getPopularCities = cache(async (limit: number = 10): Promise<CrossLinkData[]> => {
  const cities = await db.seoCombination.groupBy({
    by: ['city', 'citySlug'],
    where: { status: 'published', isIndexable: true, noIndex: false },
    _count: { id: true },
    _max: { priority: true },
    orderBy: [{ _count: { id: 'desc' } }, { _max: { priority: 'desc' } }],
    take: limit,
  });

  return cities.map((c) => ({
    city: c.city,
    citySlug: c.citySlug,
    offersCount: c._count.id,
    priority: c._max.priority,
  }));
});

/**
 * Получает все популярные типы займов для перелинковки
 */
export const getPopularLoanTypes = cache(async (limit: number = 10): Promise<CrossLinkData[]> => {
  const types = await db.seoCombination.groupBy({
    by: ['loanType', 'loanTypeSlug'],
    where: { status: 'published', isIndexable: true, noIndex: false },
    _count: { id: true },
    _max: { priority: true },
    orderBy: [{ _count: { id: 'desc' } }, { _max: { priority: 'desc' } }],
    take: limit,
  });

  return types.map((t) => ({
    loanType: t.loanType,
    loanTypeSlug: t.loanTypeSlug,
    offersCount: t._count.id,
    priority: t._max.priority,
  }));
});

/**
 * Проверяет, является ли страница "пустой" (нет офферов)
 */
export const isPageEmpty = cache(async (amount: number): Promise<boolean> => {
  const count = await getOffersCountForSeoPage(amount);
  return count === 0;
});
