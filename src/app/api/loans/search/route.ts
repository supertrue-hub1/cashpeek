import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/loans/search?amount=10000&term=14
// Поиск займов по сумме и сроку
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = parseInt(searchParams.get('amount') || '0');
    const term = parseInt(searchParams.get('term') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!amount || !term) {
      return NextResponse.json(
        { error: 'Укажите сумму и срок' },
        { status: 400 }
      );
    }

    // Поиск займов по диапазонам
    const loans = await db.loanOffer.findMany({
      where: {
        status: 'published',
        minAmount: { lte: amount },
        maxAmount: { gte: amount },
        minTerm: { lte: term },
        maxTerm: { gte: term },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        minAmount: true,
        maxAmount: true,
        minTerm: true,
        maxTerm: true,
        baseRate: true,
        firstLoanRate: true,
        approvalRate: true,
        decisionTime: true,
        features: true,
        affiliateUrl: true,
      },
      orderBy: [
        { firstLoanRate: 'asc' }, // Сначала 0%
        { baseRate: 'asc' },      // Потом по ставке
      ],
      take: Math.min(limit, 20),
    });

    // Парсим features
    const loansWithFeatures = loans.map(loan => ({
      ...loan,
      features: loan.features ? JSON.parse(loan.features) : [],
      isFirstLoanFree: loan.firstLoanRate === 0,
    }));

    return NextResponse.json({
      success: true,
      loans: loansWithFeatures,
      count: loansWithFeatures.length,
    });
  } catch (error) {
    console.error('Search loans error:', error);
    return NextResponse.json(
      { error: 'Ошибка поиска займов' },
      { status: 500 }
    );
  }
}
