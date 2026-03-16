import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { analyzeDebts, type DebtInput } from '@/lib/ai/debt-analyzer';

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
      orderBy: { createdAt: 'desc' },
    });

    if (debts.length === 0) {
      return NextResponse.json({
        plan: 'У вас нет зарегистрированных долгов. Добавьте первый долг для анализа.',
        method: 'snowball',
        recommendations: ['Добавьте информацию о ваших кредитах и займах'],
        consolidationOpportunity: false,
        monthlySavings: 0,
        totalInterestSaved: 0,
        payoffOrder: [],
      });
    }

    const debtInputs: DebtInput[] = debts.map(d => ({
      id: d.id,
      name: d.name,
      creditor: d.creditor || undefined,
      amount: d.amount,
      interestRate: d.interestRate,
      monthlyPayment: d.monthlyPayment || undefined,
      remainingAmount: d.remainingAmount || undefined,
      type: d.type as DebtInput['type'],
      status: d.status as DebtInput['status'],
      dueDate: d.dueDate || undefined,
    }));

    const result = await analyzeDebts(debtInputs, monthlyIncome || 50000);

    // Кэшируем результат
    await db.debt.updateMany({
      where: { userId: session.user.id },
      data: {
        lastAiAnalysis: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] analyze-debt error:', error);
    return NextResponse.json(
      { error: 'Ошибка анализа долгов' },
      { status: 500 }
    );
  }
}
