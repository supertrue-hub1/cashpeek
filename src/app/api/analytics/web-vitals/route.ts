import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API для сохранения Web Vitals метрик
 * 
 * POST /api/analytics/web-vitals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      id,
      name,
      value,
      delta,
      rating,
      url,
      timestamp,
    } = body;
    
    // Валидация
    if (!id || !name || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Сохраняем в БД (опционально)
    // Можно создать таблицу WebVitalsMetric в Prisma
    // await db.webVitalsMetric.create({
    //   data: {
    //     metricId: id,
    //     name,
    //     value,
    //     delta,
    //     rating,
    //     url,
    //     timestamp: new Date(timestamp),
    //   },
    // });
    
    // Пока просто логируем
    console.log('[Web Vitals API]', {
      name,
      value: value.toFixed(2),
      rating,
      url: url?.split('?')[0],
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
