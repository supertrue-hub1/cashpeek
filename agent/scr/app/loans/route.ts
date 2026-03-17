import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// API для поиска займов в базе данных
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const amount = searchParams.get('amount')
  const term = searchParams.get('term')

  try {
    // Базовый запрос - только активные займы
    let loans = await db.loan.findMany({
      where: {
        active: true,
      },
      include: {
        mfo: true,
      },
    })

    // Фильтрация по сумме
    if (amount) {
      const amountNum = parseInt(amount)
      if (!isNaN(amountNum)) {
        loans = loans.filter(
          (loan) => loan.minAmount <= amountNum && loan.maxAmount >= amountNum
        )
      }
    }

    // Фильтрация по сроку
    if (term) {
      const termNum = parseInt(term)
      if (!isNaN(termNum)) {
        loans = loans.filter(
          (loan) => loan.minTerm <= termNum && loan.maxTerm >= termNum
        )
      }
    }

    // Сортировка по ставке (сначала самые выгодные)
    loans.sort((a, b) => a.dailyRate - b.dailyRate)

    // Ограничиваем до 5 лучших результатов
    const topLoans = loans.slice(0, 5)

    // Форматируем для фронтенда
    const formattedLoans = topLoans.map((loan) => ({
      id: loan.id,
      name: loan.name,
      mfoName: loan.mfo.name,
      mfoRating: loan.mfo.rating,
      approvalRate: loan.mfo.approvalRate,
      minAmount: loan.minAmount,
      maxAmount: loan.maxAmount,
      minTerm: loan.minTerm,
      maxTerm: loan.maxTerm,
      dailyRate: loan.dailyRate,
      firstLoanFree: loan.firstLoanFree,
      processingTime: loan.processingTime,
      requirements: loan.requirements,
      documents: loan.documents,
      link: loan.link,
    }))

    return NextResponse.json({
      success: true,
      count: formattedLoans.length,
      loans: formattedLoans,
    })
  } catch (error) {
    console.error('Error searching loans:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка поиска займов' },
      { status: 500 }
    )
  }
}
