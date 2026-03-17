import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = parseInt(searchParams.get('amount') || '10000')
    const term = parseInt(searchParams.get('term') || '14')
    const sort = searchParams.get('sort') || 'rate' // rate, approval, time

    // Построение условий сортировки
    let orderBy: any = [
      { isFeatured: 'desc' },
    ]

    if (sort === 'rate') {
      orderBy.unshift({ firstLoanRate: 'asc' })
      orderBy.unshift({ baseRate: 'asc' })
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
    const offersWithCalculation = offers.map((offer) => {
      const rate = offer.firstLoanRate ?? offer.baseRate
      const totalRepayment = Math.round(amount + (amount * rate / 100) * term)
      
      return {
        ...offer,
        rate,
        totalRepayment,
      }
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
