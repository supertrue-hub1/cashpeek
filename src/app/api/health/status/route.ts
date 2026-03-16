import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/health/status - получить общий статус системы
export async function GET(request: NextRequest) {
  try {
    // Получаем все активные страницы
    const pages = await db.healthCheckPage.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        url: true,
        category: true,
        lastStatus: true,
        lastResponseTime: true,
        lastCheckAt: true,
        priority: true,
        uptime24h: true,
        uptime7d: true,
        sslDaysLeft: true
      }
    });

    // Статистика по статусам
    const stats = {
      total: pages.length,
      healthy: pages.filter(p => p.lastStatus === 'healthy').length,
      warning: pages.filter(p => p.lastStatus === 'warning').length,
      error: pages.filter(p => p.lastStatus === 'error').length,
      critical: pages.filter(p => p.lastStatus === 'critical').length,
      unknown: pages.filter(p => p.lastStatus === 'unknown').length
    };

    // Активные инциденты
    const activeIncidents = await db.healthIncident.count({
      where: {
        status: { in: ['open', 'investigating'] }
      }
    });

    // Последние инциденты
    const recentIncidents = await db.healthIncident.findMany({
      where: {
        status: { in: ['open', 'investigating'] }
      },
      include: {
        page: {
          select: {
            name: true,
            url: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 5
    });

    // Средний uptime
    const avgUptime = pages.length > 0
      ? pages.reduce((sum, p) => sum + (p.uptime24h || 0), 0) / pages.length
      : 0;

    // Среднее время ответа
    const pagesWithResponseTime = pages.filter(p => p.lastResponseTime !== null);
    const avgResponseTime = pagesWithResponseTime.length > 0
      ? Math.round(
          pagesWithResponseTime.reduce((sum, p) => sum + (p.lastResponseTime || 0), 0) /
          pagesWithResponseTime.length
        )
      : 0;

    // SSL сертификаты, которые скоро истекут
    const sslExpiringSoon = pages.filter(p => 
      p.sslDaysLeft !== null && p.sslDaysLeft < 30
    ).length;

    // Общий статус системы
    let systemStatus: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
    
    if (stats.critical > 0) {
      systemStatus = stats.critical >= 3 ? 'major_outage' : 'partial_outage';
    } else if (stats.error > 0 || stats.warning > 2) {
      systemStatus = 'degraded';
    } else {
      systemStatus = 'operational';
    }

    return NextResponse.json({
      success: true,
      status: {
        systemStatus,
        stats,
        uptime: Math.round(avgUptime * 10) / 10,
        avgResponseTime,
        activeIncidents,
        sslExpiringSoon
      },
      pages: pages.slice(0, 20), // Первые 20 страниц
      recentIncidents
    });
  } catch (error) {
    console.error('Error fetching health status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
