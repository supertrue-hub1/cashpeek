/**
 * API Route для получения избранных офферов пользователя
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
    const favorites = await Promise.race([
      db.favoriteOffer.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      ),
    ]);

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('[API /user/favorites] Error:', error);
    return NextResponse.json([]);
  }
}
