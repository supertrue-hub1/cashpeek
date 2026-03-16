/**
 * Cached Data Fetching Functions
 * 
 * Кэшированные функции для получения данных
 * с fallback на прямые запросы к БД
 */

import { db } from '@/lib/db';
import { getOrSetCache, CacheKeys, CacheTTL } from './redis';
import type { OfferData } from '@/lib/seo-hub/types';

// ============================================
// Офферы
// ============================================

/**
 * Получение всех офферов с кэшированием
 */
export async function getCachedOffers(): Promise<OfferData[]> {
  return getOrSetCache(
    CacheKeys.offers.all,
    async () => {
      const offers = await db.loanOffer.findMany({
        where: { 
          status: 'published',
          showOnHomepage: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { rating: 'desc' },
        ],
        take: 50,
        include: {
          tags: { include: { tag: true } },
        },
      });
      
      return offers.map(formatOffer);
    },
    CacheTTL.MEDIUM
  );
}

/**
 * Получение офферов по категории с кэшированием
 */
export async function getCachedOffersByCategory(
  categorySlug: string
): Promise<OfferData[]> {
  return getOrSetCache(
    CacheKeys.offers.byCategory(categorySlug),
    async () => {
      const tagMapping: Record<string, string[]> = {
        'na-kartu': ['na-kartu', 'to-card'],
        'bez-otkaza': ['bez-otkaza', 'high-approval'],
        'bez-proverki-ki': ['bez-proverki-ki', 'bad-credit-ok'],
        'bez-procentov': ['bez-procentov', 'first-loan-zero'],
        'onlain': ['onlain', 'online-approval'],
        'kruglosutochno': ['kruglosutochno', '24-7'],
        'dlya-pensionerov': ['dlya-pensionerov', 'for-pensioners'],
        'bez-raboty': ['bez-raboty', 'no-job'],
        'studentam': ['studentam', 'for-students'],
        'na-dlitelnyy-srok': ['na-dlitelnyy-srok', 'long-term'],
      };
      
      const tags = tagMapping[categorySlug] || [];
      
      const whereClause: any = {
        status: 'published',
        showOnHomepage: true,
      };
      
      if (tags.length > 0) {
        whereClause.tags = {
          some: {
            tag: {
              slug: { in: tags },
            },
          },
        };
      }
      
      const offers = await db.loanOffer.findMany({
        where: whereClause,
        orderBy: [
          { isFeatured: 'desc' },
          { rating: 'desc' },
        ],
        take: 20,
        include: {
          tags: { include: { tag: true } },
        },
      });
      
      return offers.map(formatOffer);
    },
    CacheTTL.MEDIUM
  );
}

/**
 * Получение офферов для hub-страницы с кэшированием
 */
export async function getCachedHubOffers(
  categorySlug: string,
  citySlug: string
): Promise<{ offers: OfferData[]; isFallback: boolean }> {
  return getOrSetCache(
    CacheKeys.offers.hub(categorySlug, citySlug),
    async () => {
      const tagMapping: Record<string, string[]> = {
        'na-kartu': ['na-kartu', 'to-card'],
        'bez-otkaza': ['bez-otkaza', 'high-approval'],
        'bez-proverki-ki': ['bez-proverki-ki', 'bad-credit-ok'],
        'bez-procentov': ['bez-procentov', 'first-loan-zero'],
        'onlain': ['onlain', 'online-approval'],
        'kruglosutochno': ['kruglosutochno', '24-7'],
      };
      
      const tags = tagMapping[categorySlug] || [];
      
      const whereClause: any = {
        status: 'published',
        showOnHomepage: true,
      };
      
      if (tags.length > 0) {
        whereClause.tags = {
          some: {
            tag: {
              slug: { in: tags },
            },
          },
        };
      }
      
      let offers = await db.loanOffer.findMany({
        where: whereClause,
        orderBy: [
          { isFeatured: 'desc' },
          { rating: 'desc' },
        ],
        take: 20,
        include: {
          tags: { include: { tag: true } },
        },
      });
      
      let isFallback = false;
      
      // Fallback: если офферов мало
      if (offers.length < 5) {
        offers = await db.loanOffer.findMany({
          where: {
            status: 'published',
            showOnHomepage: true,
          },
          orderBy: [
            { isFeatured: 'desc' },
            { rating: 'desc' },
          ],
          take: 20,
          include: {
            tags: { include: { tag: true } },
          },
        });
        isFallback = true;
      }
      
      return {
        offers: offers.map(formatOffer),
        isFallback,
      };
    },
    CacheTTL.MEDIUM
  );
}

// ============================================
// Форматирование
// ============================================

function formatOffer(offer: any): OfferData {
  const parseJsonArray = (value: unknown): string[] => {
    if (!value) return ['passport'];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : ['passport'];
      } catch {
        return ['passport'];
      }
    }
    return ['passport'];
  };
  
  const slugToFeature: Record<string, string> = {
    'first-loan-zero': 'first_loan_zero',
    'no-overpayments': 'no_overpayments',
    'prolongation': 'prolongation',
    'early-repayment': 'early_repayment',
    'no-hidden-fees': 'no_hidden_fees',
    'online-approval': 'online_approval',
    'one-document': 'one_document',
    'loyalty-program': 'loyalty_program',
  };
  
  return {
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    logo: offer.logo || undefined,
    rating: offer.rating,
    minAmount: offer.minAmount,
    maxAmount: offer.maxAmount,
    minTerm: offer.minTerm || 1,
    maxTerm: offer.maxTerm || 30,
    baseRate: offer.baseRate || 0.8,
    firstLoanRate: offer.firstLoanRate ?? undefined,
    decisionTime: offer.decisionTime || 15,
    approvalRate: offer.approvalRate || 85,
    features: offer.tags?.map((t: any) => slugToFeature[t.tag.slug]).filter(Boolean) || ['online_approval'],
    payoutMethods: parseJsonArray(offer.payoutMethods),
    badCreditOk: offer.badCreditOk ?? false,
    noCalls: offer.noCalls ?? false,
    roundTheClock: offer.roundTheClock ?? false,
    minAge: offer.minAge || 18,
    documents: parseJsonArray(offer.documents),
    editorNote: offer.customDescription || undefined,
    affiliateUrl: offer.affiliateUrl || '#',
    isFeatured: offer.isFeatured ?? false,
    isNew: offer.isNew ?? false,
    isPopular: offer.isPopular ?? false,
  };
}
