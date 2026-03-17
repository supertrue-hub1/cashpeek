import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Извлечение суммы из текста
function extractAmount(text: string): number | null {
  const numbers = text.match(/\d+/g);
  if (!numbers) return null;
  
  let amount = parseInt(numbers[0]);
  
  if (text.toLowerCase().includes('тыс') || text.toLowerCase().includes('т.р') || text.toLowerCase().includes('тр')) {
    amount *= 1000;
  }
  
  return amount;
}

// Извлечение срока из текста
function extractTerm(text: string): number | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('недел')) {
    const numbers = text.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) * 7 : 7;
  }
  
  if (lowerText.includes('месяц')) {
    const numbers = text.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) * 30 : 30;
  }
  
  const daysMatch = text.match(/(\d+)\s*дней?/);
  if (daysMatch) {
    return parseInt(daysMatch[1]);
  }
  
  return null;
}

// Поиск МФО
async function searchMfos(amount: number, term: number, limit: number = 4) {
  try {
    const mfos = await db.assistantMfo.findMany({
      where: {
        isActive: true,
        minAmount: { lte: amount },
        maxAmount: { gte: amount },
        minTerm: { lte: term },
        maxTerm: { gte: term },
      },
      orderBy: [
        { firstLoanRate: 'asc' },
        { sortOrder: 'asc' },
      ],
      take: limit,
    });

    return mfos;
  } catch (error) {
    console.error('DB error:', error);
    return [];
  }
}

// Формирование ответа
function formatResponse(mfos: any[], amount: number, term: number): string {
  if (mfos.length === 0) {
    return `К сожалению, нет подходящих вариантов на ${amount.toLocaleString()} ₽ на ${term} дней.

Попробуйте изменить параметры:
• Увеличьте срок до ${term + 7} дней
• Или сумму до ${amount + 5000} ₽`;
  }

  let response = `Подобрал ${mfos.length} варианта на ${amount.toLocaleString()} ₽:\n\n`;

  mfos.forEach((mfo, i) => {
    const rate = mfo.firstLoanRate === 0 ? '0%' : `${mfo.baseRate}%`;
    response += `${i + 1}. ${mfo.name}: ${mfo.minAmount.toLocaleString()}-${mfo.maxAmount.toLocaleString()} ₽, ставка ${rate}/день`;
    if (mfo.firstLoanRate === 0) response += ` ✅`;
    response += `\n\n`;
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Нет сообщения' }, { status: 400 });
    }

    const amount = extractAmount(message);
    const term = extractTerm(message);

    if (!amount || !term) {
      return NextResponse.json({
        success: true,
        response: `Напишите сумму и срок, например:
• "10 000 рублей на 2 недели"
• "5 тыс на неделю"
• "30 000 на месяц"`,
        loans: [],
      });
    }

    const mfos = await searchMfos(amount, term, 4);
    const response = formatResponse(mfos, amount, term);

    return NextResponse.json({
      success: true,
      response,
      loans: mfos.map(m => ({
        id: m.id,
        name: m.name,
        logo: m.logo,
        rate: m.firstLoanRate === 0 ? 0 : m.baseRate,
        term: `${m.minTerm}-${m.maxTerm} дней`,
        amount: `${m.minAmount}-${m.maxAmount}`,
        affiliateUrl: m.affiliateUrl,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
