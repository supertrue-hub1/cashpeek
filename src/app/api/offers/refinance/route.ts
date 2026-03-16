import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/offers/refinance
 * Получить предложения для рефинансирования (3 займа, первый с 0%)
 */
export async function GET() {
  try {
    // Получаем офферы со статусом published
    const offers = await db.loanOffer.findMany({
      where: {
        status: 'published',
      },
      orderBy: [
        { firstLoanRate: 'asc' },
        { rating: 'desc' },
      ],
      take: 3,
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
        features: true,
        affiliateUrl: true,
      },
    });

    if (offers.length > 0) {
      const formattedOffers = offers.map((offer, index) => {
        const isFirstZero = offer.firstLoanRate === 0;
        
        return {
          id: offer.id,
          slug: offer.slug,
          name: offer.name,
          logo: offer.logo,
          rating: offer.rating,
          minAmount: offer.minAmount,
          maxAmount: offer.maxAmount,
          minTerm: offer.minTerm,
          maxTerm: offer.maxTerm,
          baseRate: offer.baseRate,
          firstLoanRate: offer.firstLoanRate ?? offer.baseRate,
          isFirstLoanFree: isFirstZero,
          decisionTime: offer.decisionTime,
          approvalRate: offer.approvalRate,
          features: offer.features ? JSON.parse(offer.features) : [],
          affiliateUrl: offer.affiliateUrl,
          badges: [
            isFirstZero ? '0% первый займ' : null,
            index === 0 ? 'Рекомендуем' : null,
            offer.decisionTime === 0 ? 'Мгновенное решение' : `${offer.decisionTime} мин`,
          ].filter(Boolean),
        };
      });

      return NextResponse.json(formattedOffers);
    }

    // Если нет published, берём любые
    const anyOffers = await db.loanOffer.findMany({
      orderBy: [
        { firstLoanRate: 'asc' },
        { rating: 'desc' },
      ],
      take: 3,
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
        features: true,
        affiliateUrl: true,
      },
    });

    if (anyOffers.length > 0) {
      const formattedOffers = anyOffers.map((offer, index) => {
        const isFirstZero = offer.firstLoanRate === 0;
        
        return {
          id: offer.id,
          slug: offer.slug,
          name: offer.name,
          logo: offer.logo,
          rating: offer.rating,
          minAmount: offer.minAmount,
          maxAmount: offer.maxAmount,
          minTerm: offer.minTerm,
          maxTerm: offer.maxTerm,
          baseRate: offer.baseRate,
          firstLoanRate: offer.firstLoanRate ?? offer.baseRate,
          isFirstLoanFree: isFirstZero,
          decisionTime: offer.decisionTime,
          approvalRate: offer.approvalRate,
          features: offer.features ? JSON.parse(offer.features) : [],
          affiliateUrl: offer.affiliateUrl,
          badges: [
            isFirstZero ? '0% первый займ' : null,
            index === 0 ? 'Рекомендуем' : null,
            offer.decisionTime === 0 ? 'Мгновенное решение' : `${offer.decisionTime} мин`,
          ].filter(Boolean),
        };
      });

      return NextResponse.json(formattedOffers);
    }

    // Демо если БД пуста
    return NextResponse.json(getDemoOffers());
    
  } catch (error) {
    console.error('[refinance] Error:', error);
    return NextResponse.json(getDemoOffers());
  }
}

function getDemoOffers() {
  return [
    {
      id: 'demo-1',
      slug: 'zaim-fast',
      name: 'Займ Быстро',
      logo: null,
      rating: 4.8,
      minAmount: 1000,
      maxAmount: 30000,
      minTerm: 7,
      maxTerm: 30,
      baseRate: 0.8,
      firstLoanRate: 0,
      isFirstLoanFree: true,
      decisionTime: 0,
      approvalRate: 96,
      features: [],
      affiliateUrl: null,
      badges: ['0% первый займ', 'Рекомендуем', 'Мгновенное решение'],
    },
    {
      id: 'demo-2',
      slug: 'creditplus',
      name: 'CreditPlus',
      logo: null,
      rating: 4.6,
      minAmount: 2000,
      maxAmount: 50000,
      minTerm: 10,
      maxTerm: 45,
      baseRate: 0.5,
      firstLoanRate: 0,
      isFirstLoanFree: true,
      decisionTime: 5,
      approvalRate: 92,
      features: [],
      affiliateUrl: null,
      badges: ['0% первый займ'],
    },
    {
      id: 'demo-3',
      slug: 'moneyman',
      name: 'MoneyMan',
      logo: null,
      rating: 4.5,
      minAmount: 1500,
      maxAmount: 40000,
      minTerm: 5,
      maxTerm: 30,
      baseRate: 0.7,
      firstLoanRate: 0,
      isFirstLoanFree: true,
      decisionTime: 0,
      approvalRate: 94,
      features: [],
      affiliateUrl: null,
      badges: ['0% первый займ', 'Мгновенное решение'],
    },
  ];
}
