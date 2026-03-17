import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = parseInt(searchParams.get('amount') || '10000')
    const term = parseInt(searchParams.get('term') || '14')
    const sort = searchParams.get('sort') || 'rate'

    // Сортировка: 0% → 0.8% → остальные
    let orderBy: any = [
      { isFeatured: 'desc' },
    ]

    if (sort === 'rate') {
      // Сначала firstLoanRate = 0, потом 0.8, потом остальные
      orderBy.unshift({ firstLoanRate: 'asc' })
    } else if (sort === 'approval') {
      orderBy.unshift({ approvalRate: 'desc' })
    } else if (sort === 'time') {
      orderBy.unshift({ decisionTime: 'asc' })
    }

    const offers = await db.loanOffer.findMany({
      where: {
        status: 'published',
        maxAmount: { gte: amount },
        maxTerm: { gte: term },
        minTerm: { lte: term },
        showOnHomepage: true,
      },
      orderBy,
      take: 10,
      select: {
        id: true,
        name: true,
        logo: true,
        slug: true,
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
        isFeatured: true,
      },
    })

    // Рассчитываем сумму к возврату для каждого оффера
    // Логика приоритета: 0% (firstLoanRate=0) → 0.8% (baseRate=0.8) → остальные
    const offersWithCalculation = offers.map((offer) => {
      // Определяем итоговую ставку: если есть firstLoanRate - используем его, иначе baseRate
      const rate = offer.firstLoanRate !== null ? offer.firstLoanRate : offer.baseRate
      
      // Для сортировки: создаём приоритет (меньше = выше в списке)
      // 0% = приоритет 1, 0.8% = приоритет 2, остальные = приоритет 3
      let sortPriority = 3
      if (rate === 0) {
        sortPriority = 1
      } else if (rate <= 0.8) {
        sortPriority = 2
      }
      
      const totalRepayment = Math.round(amount + (amount * rate / 100) * term)
      
      return {
        ...offer,
        rate,
        sortPriority,
        totalRepayment,
      }
    })

    // Дополнительная сортировка по приоритету
    offersWithCalculation.sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority
      }
      // При одинаковом приоритете - по одобрению
      return b.approvalRate - a.approvalRate
    })

    return NextResponse.json({
      offers: offersWithCalculation,
      total: offersWithCalculation.length,
      params: { amount, term, sort },
    })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}
