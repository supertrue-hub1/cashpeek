import { db } from '@/lib/db';
import { ExternalOffer, SyncResult } from './types';

// API источники и их URL
const API_SOURCES = {
  'leads.su': {
    name: 'Leads.su',
    apiUrl: process.env.LEADS_SU_API_URL || 'https://api.leads.su/v1',
    apiKey: process.env.LEADS_SU_API_KEY,
  },
  'click2money': {
    name: 'api-traffic-handler.click2.money',
    apiUrl: process.env.CLICK2MONEY_API_URL || 'https://api-traffic-handler.click2.money/api/v1',
    apiKey: process.env.CLICK2MONEY_API_KEY,
  },
};

// Получить офферы из API источника
export async function fetchOffersFromApi(source: keyof typeof API_SOURCES): Promise<ExternalOffer[]> {
  const config = API_SOURCES[source];
  
  if (!config.apiKey) {
    console.log(`[Sync] No API key for ${source}`);
    return [];
  }

  try {
    const response = await fetch(`${config.apiUrl}/offers`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Маппинг в зависимости от формата API
    return mapApiResponse(data, source);
  } catch (error) {
    console.error(`[Sync] Error fetching from ${source}:`, error);
    return [];
  }
}

// Маппинг ответа API в стандартизированный формат
function mapApiResponse(data: any, source: string): ExternalOffer[] {
  if (!data || !Array.isArray(data.offers) && !Array.isArray(data)) {
    return [];
  }

  const offers = data.offers || data;
  
  return offers.map((item: any) => ({
    externalId: item.id?.toString() || item.offer_id?.toString(),
    name: item.name || item.title || '',
    slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-') || '',
    logo: item.logo || item.image || item.icon,
    rating: parseFloat(item.rating || item.rate || '4.5'),
    minAmount: parseInt(item.min_amount || item.minAmount || item.min_sum || '1000'),
    maxAmount: parseInt(item.max_amount || item.maxAmount || item.max_sum || '30000'),
    minTerm: parseInt(item.min_term || item.minTerm || item.min_days || '7'),
    maxTerm: parseInt(item.max_term || item.maxTerm || item.max_days || '30'),
    baseRate: parseFloat(item.rate || item.base_rate || item.baseRate || '0.8'),
    firstLoanRate: item.first_rate !== undefined ? parseFloat(item.first_rate) : undefined,
    psk: item.psk ? parseFloat(item.psk) : undefined,
    decisionTime: parseInt(item.decision_time || item.decisionTime || '5'),
    approvalRate: parseInt(item.approval_rate || item.approvalRate || '90'),
    features: item.features || item.tags || [],
    payoutMethods: item.payout_methods || item.payoutMethods || item.payment_methods || [],
    badCreditOk: item.bad_credit_ok !== undefined ? Boolean(item.bad_credit_ok) : true,
    noCalls: item.no_calls !== undefined ? Boolean(item.no_calls) : true,
    roundTheClock: item.round_the_clock !== undefined ? Boolean(item.round_the_clock) : false,
    minAge: parseInt(item.min_age || item.minAge || '18'),
    documents: item.documents || [],
    affiliateUrl: item.affiliate_url || item.affiliateUrl || item.link || item.url,
    affiliateId: item.affiliate_id || item.affiliateId,
  }));
}

// Основная функция синхронизации
export async function syncOffers(source: keyof typeof API_SOURCES): Promise<SyncResult> {
  const startTime = Date.now();
  const sourceName = API_SOURCES[source].name;
  
  console.log(`[Sync] Starting sync from ${sourceName}...`);
  
  // Получаем офферы из API
  const externalOffers = await fetchOffersFromApi(source);
  
  if (externalOffers.length === 0) {
    return {
      success: false,
      source: sourceName,
      processed: 0,
      updated: 0,
      added: 0,
      errors: 0,
      duration: Date.now() - startTime,
      errorMessage: 'No offers received from API',
    };
  }

  let updated = 0;
  let added = 0;
  let errors = 0;

  for (const externalOffer of externalOffers) {
    try {
      // Проверяем, существует ли оффер
      const existingOffer = await db.loanOffer.findFirst({
        where: {
          OR: [
            { externalId: externalOffer.externalId },
            { slug: externalOffer.slug },
          ],
        },
      });

      if (existingOffer) {
        // Обновляем существующий оффер
        await db.loanOffer.update({
          where: { id: existingOffer.id },
          data: {
            name: externalOffer.name,
            logo: externalOffer.logo,
            rating: externalOffer.rating,
            minAmount: externalOffer.minAmount,
            maxAmount: externalOffer.maxAmount,
            minTerm: externalOffer.minTerm,
            maxTerm: externalOffer.maxTerm,
            baseRate: externalOffer.baseRate,
            firstLoanRate: externalOffer.firstLoanRate,
            psk: externalOffer.psk,
            decisionTime: externalOffer.decisionTime,
            approvalRate: externalOffer.approvalRate,
            features: JSON.stringify(externalOffer.features || []),
            payoutMethods: JSON.stringify(externalOffer.payoutMethods || []),
            badCreditOk: externalOffer.badCreditOk ?? true,
            noCalls: externalOffer.noCalls ?? true,
            roundTheClock: externalOffer.roundTheClock ?? false,
            minAge: externalOffer.minAge ?? 18,
            documents: JSON.stringify(externalOffer.documents || []),
            affiliateUrl: externalOffer.affiliateUrl,
            affiliateId: externalOffer.affiliateId,
            syncSource: sourceName,
            lastSyncAt: new Date(),
            syncStatus: 'synced',
          },
        });
        updated++;
      } else {
        // Создаём новый оффер
        await db.loanOffer.create({
          data: {
            name: externalOffer.name,
            slug: externalOffer.slug,
            externalId: externalOffer.externalId,
            logo: externalOffer.logo,
            rating: externalOffer.rating || 4.5,
            minAmount: externalOffer.minAmount,
            maxAmount: externalOffer.maxAmount,
            minTerm: externalOffer.minTerm,
            maxTerm: externalOffer.maxTerm,
            baseRate: externalOffer.baseRate,
            firstLoanRate: externalOffer.firstLoanRate,
            psk: externalOffer.psk,
            decisionTime: externalOffer.decisionTime,
            approvalRate: externalOffer.approvalRate || 90,
            features: JSON.stringify(externalOffer.features || []),
            payoutMethods: JSON.stringify(externalOffer.payoutMethods || []),
            badCreditOk: externalOffer.badCreditOk ?? true,
            noCalls: externalOffer.noCalls ?? true,
            roundTheClock: externalOffer.roundTheClock ?? false,
            minAge: externalOffer.minAge ?? 18,
            documents: JSON.stringify(externalOffer.documents || []),
            affiliateUrl: externalOffer.affiliateUrl,
            affiliateId: externalOffer.affiliateId,
            syncSource: sourceName,
            lastSyncAt: new Date(),
            syncStatus: 'synced',
            status: 'draft', // Черновик по умолчанию
          },
        });
        added++;
      }
    } catch (error) {
      console.error(`[Sync] Error processing offer ${externalOffer.name}:`, error);
      errors++;
    }
  }

  // Логируем результат
  const duration = Date.now() - startTime;
  
  await db.syncLog.create({
    data: {
      source: sourceName,
      status: errors === 0 ? 'success' : errors < externalOffers.length ? 'partial' : 'error',
      offersProcessed: externalOffers.length,
      offersUpdated: updated,
      offersAdded: added,
      offersUnchanged: externalOffers.length - updated - added,
      errors,
      completedAt: new Date(),
      durationMs: duration,
    },
  });

  console.log(`[Sync] Completed: ${updated} updated, ${added} added, ${errors} errors`);

  return {
    success: errors === 0,
    source: sourceName,
    processed: externalOffers.length,
    updated,
    added,
    errors,
    duration,
  };
}

// Получить количество офферов из источника
export async function getOffersCountBySource(sourceName: string): Promise<number> {
  return db.loanOffer.count({
    where: { syncSource: sourceName },
  });
}

// Получить историю синхронизаций
export async function getSyncHistory(limit = 10) {
  return db.syncLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}
