import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - получить все долги пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const debts = await db.debt.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error('[API] debts GET error:', error);
    return NextResponse.json({ error: 'Ошибка получения долгов' }, { status: 500 });
  }
}

// POST - создать новый долг
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      creditor,
      amount,
      interestRate,
      monthlyPayment,
      remainingAmount,
      totalAmount,
      startDate,
      dueDate,
      endDate,
      type,
      status,
      notes,
    } = body;

    if (!name || !amount || !interestRate) {
      return NextResponse.json(
        { error: 'Обязательные поля: name, amount, interestRate' },
        { status: 400 }
      );
    }

    const debt = await db.debt.create({
      data: {
        userId: session.user.id,
        name,
        creditor,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : null,
        remainingAmount: remainingAmount ? parseFloat(remainingAmount) : null,
        totalAmount: totalAmount ? parseFloat(totalAmount) : null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        type: type || 'personal',
        status: status || 'active',
        notes,
      },
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error('[API] debts POST error:', error);
    return NextResponse.json({ error: 'Ошибка создания долга' }, { status: 500 });
  }
}

// DELETE - удалить долг
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Проверяем, что долг принадлежит пользователю
    const debt = await db.debt.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!debt) {
      return NextResponse.json({ error: 'Долг не найден' }, { status: 404 });
    }

    await db.debt.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] debts DELETE error:', error);
    return NextResponse.json({ error: 'Ошибка удаления долга' }, { status: 500 });
  }
}

// PATCH - обновить долг
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Проверяем владельца
    const debt = await db.debt.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!debt) {
      return NextResponse.json({ error: 'Долг не найден' }, { status: 404 });
    }

    // Подготовка данных для обновления
    const updateData: Record<string, unknown> = {};
    
    if (data.name) updateData.name = data.name;
    if (data.creditor !== undefined) updateData.creditor = data.creditor;
    if (data.amount) updateData.amount = parseFloat(data.amount);
    if (data.interestRate !== undefined) updateData.interestRate = parseFloat(data.interestRate);
    if (data.monthlyPayment !== undefined) updateData.monthlyPayment = data.monthlyPayment ? parseFloat(data.monthlyPayment) : null;
    if (data.remainingAmount !== undefined) updateData.remainingAmount = data.remainingAmount ? parseFloat(data.remainingAmount) : null;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount ? parseFloat(data.totalAmount) : null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.type) updateData.type = data.type;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await db.debt.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] debts PATCH error:', error);
    return NextResponse.json({ error: 'Ошибка обновления долга' }, { status: 500 });
  }
}
