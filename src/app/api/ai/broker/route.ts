import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatWithBroker, type DebtInput } from '@/lib/ai/debt-analyzer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Получаем долги пользователя
    const debts = await db.debt.findMany({
      where: { userId: session.user.id },
    });

    const debtInputs: DebtInput[] = debts.map(d => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      interestRate: d.interestRate,
      monthlyPayment: d.monthlyPayment || undefined,
      type: d.type as DebtInput['type'],
      status: d.status as DebtInput['status'],
    }));

    // Получаем историю чата если есть sessionId
    let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    if (sessionId) {
      const session_data = await db.debtBrokerSession.findUnique({
        where: { id: sessionId },
      });
      if (session_data?.messages) {
        try {
          history = JSON.parse(session_data.messages);
        } catch {
          history = [];
        }
      }
    }

    // Получаем ответ от AI
    const response = await chatWithBroker(message, {
      debts: debtInputs,
      history,
    });

    // Обновляем историю
    const newHistory = [
      ...history,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: response },
    ];

    // Создаём или обновляем сессию
    let updatedSessionId = sessionId;
    if (sessionId) {
      await db.debtBrokerSession.update({
        where: { id: sessionId },
        data: {
          messages: JSON.stringify(newHistory),
          updatedAt: new Date(),
        },
      });
    } else {
      const newSession = await db.debtBrokerSession.create({
        data: {
          userId: session.user.id,
          messages: JSON.stringify(newHistory),
          title: message.slice(0, 50),
        },
      });
      updatedSessionId = newSession.id;
    }

    return NextResponse.json({
      response,
      sessionId: updatedSessionId,
    });
  } catch (error) {
    console.error('[API] broker error:', error);
    return NextResponse.json(
      { error: 'Ошибка общения с брокером' },
      { status: 500 }
    );
  }
}
