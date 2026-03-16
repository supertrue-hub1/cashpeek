import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateCreditHealth, type DebtInput } from '@/lib/ai/debt-analyzer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { monthlyIncome } = body;

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

    // Получаем историю кредитного здоровья
    const healthHistory = await db.creditHealthHistory.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Рассчитываем текущее состояние
    const result = await calculateCreditHealth(
      debtInputs,
      monthlyIncome || 50000,
      [], // История платежей
      12  // Возраст аккаунта
    );

    // Сохраняем результат
    await db.creditHealthHistory.create({
      data: {
        userId: session.user.id,
        score: result.score,
        level: result.level,
        metrics: JSON.stringify(result.metrics),
        recommendations: JSON.stringify(result.recommendations),
      },
    });

    return NextResponse.json({
      ...result,
      previousScore: healthHistory?.score,
      scoreChange: healthHistory ? result.score - healthHistory.score : 0,
    });
  } catch (error) {
    console.error('[API] credit-health error:', error);
    return NextResponse.json(
      { error: 'Ошибка расчёта кредитного здоровья' },
      { status: 500 }
    );
  }
}
