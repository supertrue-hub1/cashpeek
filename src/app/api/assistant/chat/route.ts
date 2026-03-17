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

// Поиск займов
async function searchLoans(amount: number, term: number, limit: number = 4) {
  try {
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
        logo: true,
        minAmount: true,
        maxAmount: true,
        minTerm: true,
        maxTerm: true,
        baseRate: true,
        firstLoanRate: true,
        decisionTime: true,
        affiliateUrl: true,
      },
      orderBy: [
        { firstLoanRate: 'asc' },
        { baseRate: 'asc' },
      ],
      take: limit,
    });

    return loans;
  } catch (error) {
    console.error('DB error:', error);
    return [];
  }
}

// Формирование ответа
function formatResponse(loans: any[], amount: number, term: number): string {
  if (loans.length === 0) {
    return `К сожалению, нет займов на ${amount.toLocaleString()} рублей на ${term} дней.

Попробуйте изменить параметры:
• Увеличьте срок до ${term + 7} дней
• Или сумму до ${amount + 5000} рублей`;
  }

  let response = `Подобрал ${loans.length} варианта на ${amount.toLocaleString()} руб.:\n\n`;

  loans.forEach((loan, i) => {
    const rate = loan.firstLoanRate === 0 ? '0%' : `${loan.baseRate}%`;
    response += `${i + 1}. ${loan.name}: ${loan.minAmount.toLocaleString()}-${loan.maxAmount.toLocaleString()} руб., ставка ${rate}/день`;
    if (loan.firstLoanRate === 0) response += ` ✅`;
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

    const loans = await searchLoans(amount, term, 4);
    const response = formatResponse(loans, amount, term);

    return NextResponse.json({
      success: true,
      response,
      loans: loans.map(l => ({
        id: l.id,
        name: l.name,
        logo: l.logo,
        rate: l.firstLoanRate === 0 ? 0 : l.baseRate,
        term: `${l.minTerm}-${l.maxTerm} дней`,
        amount: `${l.minAmount}-${l.maxAmount}`,
        affiliateUrl: l.affiliateUrl,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
