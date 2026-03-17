import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // days

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Получаем статистику офферов
    const [
      totalOffers,
      publishedOffers,
      draftOffers,
      featuredOffers,
      recentOffers,
      syncStats,
    ] = await Promise.all([
      // Всего офферов
      db.loanOffer.count(),
      
      // Опубликованные
      db.loanOffer.count({
        where: { status: 'published' },
      }),
      
      // Черновики
      db.loanOffer.count({
        where: { status: 'draft' },
      }),
      
      // Рекомендуемые
      db.loanOffer.count({
        where: { isFeatured: true, status: 'published' },
      }),
      
      // Недавно обновлённые офферы
      db.loanOffer.findMany({
        where: {
          updatedAt: { gte: startDate },
        },
        select: {
          id: true,
          name: true,
          status: true,
          viewsCount: true,
          clicksCount: true,
          conversionsCount: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      
      // Статистика синхронизации
      db.syncLog.findMany({
        where: {
          startedAt: { gte: startDate },
        },
        orderBy: { startedAt: 'desc' },
        take: 5,
      }),
    ]);

    // Получаем статистику по кликам и конверсиям за период
    const offersWithStats = await db.loanOffer.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        name: true,
        viewsCount: true,
        clicksCount: true,
        conversionsCount: true,
        isFeatured: true,
      },
      orderBy: { conversionsCount: 'desc' },
      take: 10,
    });

    // Рассчитываем общее количество кликов и конверсий
    const totalClicks = offersWithStats.reduce((sum, o) => sum + (o.clicksCount || 0), 0);
    const totalConversions = offersWithStats.reduce((sum, o) => sum + (o.conversionsCount || 0), 0);
    const totalViews = offersWithStats.reduce((sum, o) => sum + (o.viewsCount || 0), 0);

    // Последняя успешная синхронизация
    const lastSync = await db.syncLog.findFirst({
      where: { status: 'success' },
      orderBy: { startedAt: 'desc' },
    });

    // Количество тегов
    const totalTags = await db.tag.count();

    // Количество пользователей
    const totalUsers = await db.user.count();

    return NextResponse.json({
      // Статистика офферов
      offers: {
        total: totalOffers,
        published: publishedOffers,
        draft: draftOffers,
        featured: featuredOffers,
        tags: totalTags,
      },
      
      // Статистика активности
      stats: {
        views: totalViews,
        clicks: totalClicks,
        conversions: totalConversions,
        users: totalUsers,
      },
      
      // Топ офферы по конверсиям
      topOffers: offersWithStats.slice(0, 5).map((offer, index) => ({
        rank: index + 1,
        id: offer.id,
        name: offer.name,
        conversions: offer.conversionsCount || 0,
        clicks: offer.clicksCount || 0,
        views: offer.viewsCount || 0,
        isFeatured: offer.isFeatured,
      })),
      
      // Недавно обновлённые
      recentUpdates: recentOffers.map(offer => ({
        id: offer.id,
        name: offer.name,
        status: offer.status,
        updatedAt: offer.updatedAt.toISOString(),
      })),
      
      // Синхронизация
      sync: {
        lastSync: lastSync ? {
          id: lastSync.id,
          source: lastSync.source,
          status: lastSync.status,
          startedAt: lastSync.startedAt.toISOString(),
          completedAt: lastSync.completedAt?.toISOString(),
          offersUpdated: lastSync.offersUpdated,
          offersAdded: lastSync.offersAdded,
          errors: lastSync.errors,
        } : null,
        recentSyncs: syncStats.map(sync => ({
          id: sync.id,
          source: sync.source,
          status: sync.status,
          startedAt: sync.startedAt.toISOString(),
          offersProcessed: sync.offersProcessed,
          offersUpdated: sync.offersUpdated,
          errors: sync.errors,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to fetch dashboard statistics',
      details: errorMessage
    }, { status: 500 });
  }
}
