import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * SEO Health Auditor API
 * Возвращает статистику состояния SEO-страниц
 * 
 * GET /api/seo/health
 * 
 * Ответ:
 * {
 *   "status": "ok",
 *   "timestamp": "2026-01-15T12:00:00Z",
 *   "summary": {
 *     "totalCombinations": 691000,
 *     "published": 650000,
 *     "indexable": 620000,
 *     "nonIndexable": 30000
 *   },
 *   "pages": {
 *     "withOffers": 580000,
 *     "withoutOffers": 110000,
 *     "zeroOffersPercent": 15.9
 *   },
 *   "quality": {
 *     "highPriority": 45000,
 *     "mediumPriority": 250000,
 *     "lowPriority": 325000
 *   },
 *   "issues": {
 *     "noOffers": 110000,
 *     "noIndexMarked": 30000,
 *     "brokenLinks": 0
 *   },
 *   "topCities": [...],
 *   "topTypes": [...]
 * }
 */
export async function GET() {
  try {
    const startTime = Date.now();

    // 1. Получаем общее количество комбинаций
    const [
      totalCombinations,
      publishedCount,
      indexableCount,
      nonIndexableCount,
      // Статистика по приоритетам
      highPriority,
      mediumPriority,
      lowPriority,
    ] = await Promise.all([
      // Всего комбинаций
      db.seoCombination.count(),
      
      // Опубликованные
      db.seoCombination.count({
        where: { status: 'published' },
      }),
      
      // Индексируемые
      db.seoCombination.count({
        where: { isIndexable: true, noIndex: false },
      }),
      
      // Неиндексируемые
      db.seoCombination.count({
        where: { OR: [{ isIndexable: false }, { noIndex: true }] },
      }),
      
      // Высокий приоритет
      db.seoCombination.count({
        where: { priority: { gte: 8 } },
      }),
      
      // Средний приоритет
      db.seoCombination.count({
        where: { priority: { gte: 5, lt: 8 } },
      }),
      
      // Низкий приоритет
      db.seoCombination.count({
        where: { priority: { lt: 5 } },
      }),
    ]);

    // 2. Получаем статистику по офферам (через агрегацию)
    // Для этого используем groupBy по citySlug + loanTypeSlug
    const offersStats = await db.seoCombination.groupBy({
      by: ['citySlug', 'loanTypeSlug'],
      where: { status: 'published' },
      _count: {
        id: true,
      },
      _max: {
        priority: true,
      },
    });

    // Считаем страницы с офферами (те, которые есть в seoCombination с published)
    const pagesWithOffers = publishedCount; // Упрощённо - все published считаем активными
    const pagesWithoutOffers = totalCombinations - publishedCount;
    const zeroOffersPercent = totalCombinations > 0 
      ? ((pagesWithoutOffers / totalCombinations) * 100).toFixed(1)
      : '0';

    // 3. Топ городов по количеству страниц
    const topCities = await db.seoCombination.groupBy({
      by: ['city', 'citySlug'],
      where: { status: 'published', isIndexable: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 20,
    });

    // 4. Топ типов займов
    const topTypes = await db.seoCombination.groupBy({
      by: ['loanType', 'loanTypeSlug'],
      where: { status: 'published', isIndexable: true },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 15,
    });

    // 5. Страницы требующие внимания (noIndex, но не помечены)
    const needsAttention = await db.seoCombination.count({
      where: {
        status: 'published',
        isIndexable: true,
        noIndex: false,
        priority: { lt: 3 }, // Низкий приоритет = возможно неактуально
      },
    });

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      summary: {
        totalCombinations,
        published: publishedCount,
        indexable: indexableCount,
        nonIndexable: nonIndexableCount,
      },
      pages: {
        withOffers: pagesWithOffers,
        withoutOffers: pagesWithoutOffers,
        zeroOffersPercent: parseFloat(zeroOffersPercent),
      },
      quality: {
        highPriority,
        mediumPriority,
        lowPriority,
      },
      issues: {
        noOffers: pagesWithoutOffers,
        noIndexMarked: nonIndexableCount,
        brokenLinks: 0, // Пока не отслеживаем
        needsAttention,
      },
      topCities: topCities.map((c) => ({
        name: c.city,
        slug: c.citySlug,
        pages: c._count.id,
      })),
      topTypes: topTypes.map((t) => ({
        name: t.loanType,
        slug: t.loanTypeSlug,
        pages: t._count.id,
      })),
    });
  } catch (error) {
    console.error('[SEO Health] Error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
