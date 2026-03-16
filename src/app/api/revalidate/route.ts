import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand Revalidation API
 * POST /api/revalidate
 * 
 * Body: { 
 *   tag?: string,       // Тег для инвалидации
 *   secret?: string     // Секретный ключ
 * }
 * 
 * Используется для обновления кэша при изменении данных в админке
 */

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag, secret } = body;

    // Проверка секретного ключа
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    const results: string[] = [];

    // Инвалидация по тегу (Next.js 16 требует второй аргумент)
    if (tag) {
      revalidateTag(tag, 'max');
      results.push(`Tag revalidated: ${tag}`);
    } else {
      // Если тег не указан — инвалидация всех SEO-тегов
      revalidateTag('offers', 'max');
      revalidateTag('seo-pages', 'max');
      results.push('Tag revalidated: offers, seo-pages');
    }

    return NextResponse.json({
      revalidated: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
}

// GET для проверки статуса
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation API is running',
    timestamp: new Date().toISOString(),
  });
}
