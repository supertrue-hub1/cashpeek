import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/assistant/mfo/[id] - получить одно МФО
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mfo = await db.assistantMfo.findUnique({
      where: { id },
    });
    
    if (!mfo) {
      return NextResponse.json({ error: 'МФО не найдено' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, mfo });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}

// PUT /api/assistant/mfo/[id] - обновить МФО
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const mfo = await db.assistantMfo.update({
      where: { id },
      data: {
        name: body.name,
        logo: body.logo,
        minAmount: body.minAmount,
        maxAmount: body.maxAmount,
        minTerm: body.minTerm,
        maxTerm: body.maxTerm,
        baseRate: body.baseRate,
        firstLoanRate: body.firstLoanRate,
        decisionTime: body.decisionTime,
        affiliateUrl: body.affiliateUrl,
        features: body.features,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    });
    
    return NextResponse.json({ success: true, mfo });
  } catch (error) {
    console.error('Update MFO error:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

// DELETE /api/assistant/mfo/[id] - удалить МФО
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.assistantMfo.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}
