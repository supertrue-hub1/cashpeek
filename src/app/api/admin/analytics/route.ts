import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '7'); // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDatePrev = new Date();
    startDatePrev.setDate(startDatePrev.getDate() - period * 2);

    // Получаем все опубликованные офферы с их статистикой
    const offers = await db.loanOffer.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        name: true,
        viewsCount: true,
        clicksCount: true,
        conversionsCount: true,
        isFeatured: true,
        isNew: true,
        rating: true,
      },
      orderBy: { conversionsCount: 'desc' },
    });

    // Рассчитываем общую статистику
    const totalViews = offers.reduce((sum, o) => sum + (o.viewsCount || 0), 0);
    const totalClicks = offers.reduce((sum, o) => sum + (o.clicksCount || 0), 0);
    const totalConversions = offers.reduce((sum, o) => sum + (o.conversionsCount || 0), 0);
    
    // Рассчитываем CR (conversion rate)
    const cr = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';
    
    // Доход (пока заглушка - нужно поле в БД или внешний API)
    const estimatedRevenue = totalConversions * 500; // ~500 руб за конверсию (усредненно)

    // Топ офферы
    const topOffers = offers.slice(0, 10).map((offer, index) => {
      const offerCr = offer.clicksCount ? ((offer.conversionsCount || 0) / offer.clicksCount * 100).toFixed(2) : '0.00';
      const epc = offer.clicksCount ? ((offer.conversionsCount || 0) * 500 / offer.clicksCount).toFixed(2) : '0.00'; // EPC = конверсии * средний доход / клики
      
      return {
        rank: index + 1,
        id: offer.id,
        name: offer.name,
        clicks: offer.clicksCount || 0,
        conversions: offer.conversionsCount || 0,
        cr: parseFloat(offerCr),
        epc: parseFloat(epc),
        revenue: (offer.conversionsCount || 0) * 500, // оценка
        isFeatured: offer.isFeatured,
        rating: offer.rating,
      };
    });

    // Распределение по статусам офферов
    const offerStatusDistribution = await db.loanOffer.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Распределение по isNew
    const newOffers = await db.loanOffer.count({
      where: { isNew: true, status: 'published' },
    });

    // Распределение по isFeatured
    const featuredOffers = await db.loanOffer.count({
      where: { isFeatured: true, status: 'published' },
    });

    // Последняя синхронизация
    const lastSync = await db.syncLog.findFirst({
      where: { status: 'success' },
      orderBy: { startedAt: 'desc' },
    });

    // Количество тегов
    const totalTags = await db.tag.count();

    // Количество пользователей
    const totalUsers = await db.user.count();

    // Данные по дням (упрощенно - без реальной истории, генерируем на основе текущих данных)
    // В реальном проекте нужна таблица для хранения истории
    const dailyData = generateDailyData(period);

    // Воронка (упрощенная модель)
    // В реальном проекте нужны события для отслеживания
    const funnel = {
      visits: totalViews || 10000, // заглушка если нет данных
      offerViews: Math.floor((totalViews || 10000) * 0.4),
      clicks: totalClicks || 1000,
      applications: Math.floor((totalClicks || 1000) * 0.3),
      approvals: totalConversions || 100,
    };

    return NextResponse.json({
      // KPI
      kpi: {
        clicks: totalClicks,
        conversions: totalConversions,
        cr: parseFloat(cr),
        revenue: estimatedRevenue,
        views: totalViews,
      },
      
      // Топ офферы
      topOffers,
      
      // Распределение
      distribution: {
        byStatus: offerStatusDistribution.map(s => ({
          status: s.status,
          count: s._count.id,
        })),
        newOffers,
        featuredOffers,
        totalOffers: offers.length,
        totalTags,
        totalUsers,
      },
      
      // Ежедневные данные
      dailyData,
      
      // Воронка
      funnel,
      
      // Мета
      meta: {
        period,
        lastSync: lastSync ? {
          source: lastSync.source,
          startedAt: lastSync.startedAt.toISOString(),
          offersUpdated: lastSync.offersUpdated,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: errorMessage
    }, { status: 500 });
  }
}

// Генерация ежедневных данных (заглушка - в реальном проекте нужна таблица истории)
function generateDailyData(days: number) {
  const data = [];
  const now = new Date();
  
  // Базовые значения для генерации реалистичных данных
  const baseClicks = 200;
  const baseConversions = 15;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Добавляем случайность (±30%)
    const randomFactor = 0.7 + Math.random() * 0.6;
    // Добавляем недельную сезонность (выходные меньше)
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1;
    
    const clicks = Math.floor(baseClicks * randomFactor * weekendFactor);
    const conversions = Math.floor(baseConversions * randomFactor * weekendFactor);
    
    data.push({
      date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' }),
      dateISO: date.toISOString().split('T')[0],
      clicks,
      conversions,
      revenue: conversions * 500,
    });
  }
  
  return data;
}
