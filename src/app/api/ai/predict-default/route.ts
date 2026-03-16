import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { predictDefault, type DebtInput } from '@/lib/ai/debt-analyzer';

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
      dueDate: d.dueDate || undefined,
    }));

    // Получаем историю платежей (упрощённо - можно расширить)
    const paymentHistory: Array<{ onTime: boolean; date: Date }> = [];

    const result = await predictDefault(
      debtInputs,
      monthlyIncome || 50000,
      paymentHistory
    );

    // Сохраняем результат в долгах
    if (debts.length > 0) {
      await db.debt.updateMany({
        where: { userId: session.user.id },
        data: {
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] predict-default error:', error);
    return NextResponse.json(
      { error: 'Ошибка прогнозирования риска' },
      { status: 500 }
    );
  }
}
