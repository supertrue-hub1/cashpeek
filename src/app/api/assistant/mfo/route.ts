import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/assistant/mfo - получить все МФО
export async function GET() {
  try {
    // Возвращаем все МФО (включая неактивные) для админки
    const mfos = await db.assistantMfo.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    
    return NextResponse.json({ success: true, mfos });
  } catch (error) {
    console.error('Get MFOs error:', error);
    return NextResponse.json({ success: true, mfos: [] });
  }
}

// POST /api/assistant/mfo - создать МФО
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const mfo = await db.assistantMfo.create({
      data: {
        name: body.name,
        logo: body.logo || null,
        minAmount: body.minAmount || 1000,
        maxAmount: body.maxAmount || 30000,
        minTerm: body.minTerm || 7,
        maxTerm: body.maxTerm || 30,
        baseRate: body.baseRate || 0.8,
        firstLoanRate: body.firstLoanRate ?? null,
        decisionTime: body.decisionTime || 5,
        affiliateUrl: body.affiliateUrl || null,
        features: body.features || null,
        sortOrder: body.sortOrder || 1,
        isActive: body.isActive ?? true,
      },
    });
    
    return NextResponse.json({ success: true, mfo });
  } catch (error) {
    console.error('Create MFO error:', error);
    return NextResponse.json({ error: 'Ошибка создания МФО' }, { status: 500 });
  }
}
