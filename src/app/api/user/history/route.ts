/**
 * API Route для получения истории поиска пользователя
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const maxDuration = 5; // 5 секунд максимум

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    // Простой запрос с таймаутом
    const history = await Promise.race([
      db.searchHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      ),
    ]);

    return NextResponse.json(history);
  } catch (error) {
    console.error('[API /user/history] Error:', error);
    return NextResponse.json([]);
  }
}
