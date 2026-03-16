import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { findRefinanceOptions, type DebtInput } from '@/lib/ai/debt-analyzer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { creditScore } = body;

    // Получаем долги пользователя
    const debts = await db.debt.findMany({
      where: { 
        userId: session.user.id,
        status: 'active',
      },
    });

    if (debts.length === 0) {
      return NextResponse.json([]);
    }

    const debtInputs: DebtInput[] = debts.map(d => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      interestRate: d.interestRate,
      monthlyPayment: d.monthlyPayment || undefined,
      type: d.type as DebtInput['type'],
      status: d.status as DebtInput['status'],
    }));

    const options = await findRefinanceOptions(debtInputs, creditScore || 650);

    return NextResponse.json(options);
  } catch (error) {
    console.error('[API] refinance error:', error);
    return NextResponse.json(
      { error: 'Ошибка поиска предложений' },
      { status: 500 }
    );
  }
}
