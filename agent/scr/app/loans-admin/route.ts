import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST - создать займ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      mfoId,
      name,
      minAmount,
      maxAmount,
      minTerm,
      maxTerm,
      dailyRate,
      firstLoanFree,
      processingTime,
      link,
      requirements,
      active,
    } = body

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await db.$executeRaw`
      INSERT INTO Loan (
        id, mfoId, name, minAmount, maxAmount, minTerm, maxTerm,
        dailyRate, firstLoanFree, processingTime, link, requirements,
        active, createdAt, updatedAt
      ) VALUES (
        ${id}, ${mfoId}, ${name}, ${minAmount}, ${maxAmount}, ${minTerm}, ${maxTerm},
        ${dailyRate}, ${firstLoanFree ? 1 : 0}, ${processingTime || 15}, ${link || ''}, ${requirements || ''},
        ${active !== false ? 1 : 0}, ${now}, ${now}
      )
    `

    return NextResponse.json({
      success: true,
      loan: {
        id,
        mfoId,
        name,
        minAmount,
        maxAmount,
        minTerm,
        maxTerm,
        dailyRate,
        firstLoanFree,
        processingTime,
        link,
        requirements,
        active: active !== false,
      },
    })
  } catch (error) {
    console.error('Error creating loan:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка создания займа' },
      { status: 500 }
    )
  }
}

// PUT - обновить займ
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      name,
      minAmount,
      maxAmount,
      minTerm,
      maxTerm,
      dailyRate,
      firstLoanFree,
      processingTime,
      link,
      requirements,
      active,
    } = body

    const now = new Date().toISOString()

    await db.$executeRaw`
      UPDATE Loan SET
        name = ${name},
        minAmount = ${minAmount},
        maxAmount = ${maxAmount},
        minTerm = ${minTerm},
        maxTerm = ${maxTerm},
        dailyRate = ${dailyRate},
        firstLoanFree = ${firstLoanFree ? 1 : 0},
        processingTime = ${processingTime || 15},
        link = ${link || ''},
        requirements = ${requirements || ''},
        active = ${active !== false ? 1 : 0},
        updatedAt = ${now}
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating loan:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления займа' },
      { status: 500 }
    )
  }
}

// DELETE - удалить займ
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID не указан' },
        { status: 400 }
      )
    }

    await db.$executeRaw`DELETE FROM Loan WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting loan:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления займа' },
      { status: 500 }
    )
  }
}
