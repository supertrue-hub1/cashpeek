import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - получить все МФО с займами
export async function GET() {
  try {
    const mfos = await db.$queryRaw`
      SELECT
        m.id as mfoId,
        m.name as mfoName,
        m.description,
        m.rating,
        m.approvalRate,
        m.website,
        l.id as loanId,
        l.name as loanName,
        l.minAmount,
        l.maxAmount,
        l.minTerm,
        l.maxTerm,
        l.dailyRate,
        l.firstLoanFree,
        l.processingTime,
        l.link,
        l.active,
        l.requirements
      FROM MFO m
      LEFT JOIN Loan l ON m.id = l.mfoId
      ORDER BY m.name, l.name
    `

    // Группируем по МФО
    const mfosMap = new Map()

    for (const row of mfos as any[]) {
      if (!mfosMap.has(row.mfoId)) {
        mfosMap.set(row.mfoId, {
          id: row.mfoId,
          name: row.mfoName,
          description: row.description,
          rating: row.rating,
          approvalRate: row.approvalRate,
          website: row.website,
          loans: [],
        })
      }

      if (row.loanId) {
        mfosMap.get(row.mfoId).loans.push({
          id: row.loanId,
          name: row.loanName,
          minAmount: row.minAmount,
          maxAmount: row.maxAmount,
          minTerm: row.minTerm,
          maxTerm: row.maxTerm,
          dailyRate: row.dailyRate,
          firstLoanFree: Boolean(row.firstLoanFree),
          processingTime: row.processingTime,
          link: row.link,
          active: Boolean(row.active),
          requirements: row.requirements,
        })
      }
    }

    return NextResponse.json({
      success: true,
      mfos: Array.from(mfosMap.values()),
    })
  } catch (error) {
    console.error('Error fetching MFOs:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки МФО' },
      { status: 500 }
    )
  }
}

// POST - создать новое МФО
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, rating, approvalRate, website } = body

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await db.$executeRaw`
      INSERT INTO MFO (id, name, description, rating, approvalRate, website, createdAt, updatedAt)
      VALUES (${id}, ${name}, ${description || ''}, ${rating || 4.0}, ${approvalRate || 0.7}, ${website || ''}, ${now}, ${now})
    `

    return NextResponse.json({
      success: true,
      mfo: { id, name, description, rating, approvalRate, website, loans: [] },
    })
  } catch (error) {
    console.error('Error creating MFO:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка создания МФО' },
      { status: 500 }
    )
  }
}
