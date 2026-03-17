import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Интерфейсы
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LoanData {
  id: string;
  name: string;
  logo: string | null;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate: number | null;
  approvalRate: number;
  decisionTime: number;
  features: string[];
  affiliateUrl: string | null;
  isFirstLoanFree: boolean;
}

// Извлечение суммы из текста
function extractAmount(text: string): number | null {
  // Убираем всё кроме цифр
  const numbers = text.match(/\d+/g);
  if (!numbers) return null;
  
  let amount = parseInt(numbers[0]);
  
  // Проверяем "тыс", "тысяч", "тр"
  if (text.toLowerCase().includes('тыс') || text.toLowerCase().includes('т.р') || text.toLowerCase().includes('тр')) {
    amount *= 1000;
  }
  
  return amount;
}

// Извлечение срока из текста
function extractTerm(text: string): number | null {
  const lowerText = text.toLowerCase();
  
  // Неделя
  if (lowerText.includes('недел')) {
    const numbers = text.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) * 7 : 7;
  }
  
  // Месяц
  if (lowerText.includes('месяц')) {
    const numbers = text.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) * 30 : 30;
  }
  
  // Дни
  const daysMatch = text.match(/(\d+)\s*дней?/);
  if (daysMatch) {
    return parseInt(daysMatch[1]);
  }
  
  return null;
}

// Поиск займов
async function searchLoans(amount: number, term: number, limit: number = 4) {
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
      approvalRate: true,
      decisionTime: true,
      features: true,
      affiliateUrl: true,
    },
    orderBy: [
      { firstLoanRate: 'asc' },
      { baseRate: 'asc' },
    ],
    take: limit,
  });

  return loans.map(loan => ({
    ...loan,
    features: loan.features ? JSON.parse(loan.features) : [],
    isFirstLoanFree: loan.firstLoanRate === 0,
  }));
}

// Формирование ответа ИИ
function formatLoanResponse(loans: LoanData[], amount: number, term: number): string {
  if (loans.length === 0) {
    return `К сожалению, нет займов на ${amount.toLocaleString()} рублей на ${term} дней.

Попробуйте изменить параметры:
• Увеличьте срок до ${term + 7} дней
• Увеличьте сумму до ${amount + 5000} рублей

Какие параметры подойдут вам лучше?`;
  }

  let response = `Подобрал для вас ${loans.length} варианта на ${amount.toLocaleString()} руб.:\n\n`;

  loans.forEach((loan, index) => {
    const rate = loan.isFirstLoanFree ? '0%' : `${loan.baseRate}%`;
    const termText = loan.minTerm === loan.maxTerm 
      ? `${loan.maxTerm} дн.` 
      : `до ${loan.maxTerm} дн.`;
    
    response += `${index + 1}. ${loan.name}: ${loan.minAmount.toLocaleString()}-${loan.maxAmount.toLocaleString()} руб. на ${termText}, ставка ${rate} в день`;
    
    if (loan.isFirstLoanFree) {
      response += ` ✅ Первый займ 0%`;
    }
    if (loan.decisionTime === 0) {
      response += ` ⚡ Моментально`;
    }
    
    response += `\n\n`;
  });

  response += `Какой вариант рассмотреть подробнее?`;

  return response;
}

// POST /api/assistant/chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение обязательно' },
        { status: 400 }
      );

    }

    // Проверяем, ищет ли пользователь займ
    const amount = extractAmount(message);
    const term = extractTerm(message);

    let responseText: string;
    let loansFound = 0;
    let loans: LoanData[] = [];

    // Если удалось извлечь сумму и срок - ищем займы
    if (amount && term) {
      loans = await searchLoans(amount, term, 4);
      loansFound = loans.length;
      responseText = formatLoanResponse(loans, amount, term);
    } else {
      // Стандартный ответ
      responseText = `Здравствуйте! 👋 Ищете займ? Помогу подобрать лучшие предложения.

Напишите сумму и срок, например:
• "10 000 рублей на 2 недели"
• "5 тыс на неделю"
• "30 000 на месяц"`;
    }

    // Сохраняем сессию
    const sessionId = request.cookies.get('chat-session')?.value || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messages: Message[] = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: responseText },
    ];

    await db.chatSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        messages: JSON.stringify(messages),
      },
      update: {
        messages: JSON.stringify(messages),
      },
    });

    return NextResponse.json({
      success: true,
      response: responseText,
      loansFound,
      loans: loans.map(l => ({
        id: l.id,
        name: l.name,
        logo: l.logo,
        rate: l.isFirstLoanFree ? 0 : l.baseRate,
        term: `${l.minTerm}-${l.maxTerm} дней`,
        amount: `${l.minAmount}-${l.maxAmount}`,
        affiliateUrl: l.affiliateUrl,
      })),
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Ошибка обработки запроса' },
      { status: 500 }
    );
  }
}
