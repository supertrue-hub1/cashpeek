import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/assistant/mfo - получить все МФО
export async function GET() {
  try {
    const mfos = await db.assistantMfo.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    
    return NextResponse.json({ success: true, mfos });
  } catch (error) {
    console.error('Get MFOs error:', error);
    // Если таблицы нет - возвращаем пустой массив
    return NextResponse.json({ success: true, mfos: [] });
  }
}

// POST /api/assistant/mfo - создать МФО
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Проверка обязательных полей
    if (!body.name) {
      return NextResponse.json({ error: 'Название обязательно' }, { status: 400 });
    }
    
    const mfo = await db.assistantMfo.create({
      data: {
        name: body.name,
        logo: body.logo || null,
        minAmount: Number(body.minAmount) || 1000,
        maxAmount: Number(body.maxAmount) || 30000,
        minTerm: Number(body.minTerm) || 7,
        maxTerm: Number(body.maxTerm) || 30,
        baseRate: Number(body.baseRate) || 0.8,
        firstLoanRate: body.firstLoanRate !== undefined ? Number(body.firstLoanRate) : null,
        decisionTime: Number(body.decisionTime) || 5,
        affiliateUrl: body.affiliateUrl || null,
        features: body.features || null,
        sortOrder: Number(body.sortOrder) || 1,
        isActive: body.isActive !== false,
      },
    });
    
    return NextResponse.json({ success: true, mfo });
  } catch (error: any) {
    console.error('Create MFO error:', error);
    
    // Если таблицы нет
    if (error?.code === 'P2021') {
      return NextResponse.json({ 
        error: 'Таблица не найдена. Выполните: npx prisma db push' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Ошибка создания МФО' }, { status: 500 });
  }
}
