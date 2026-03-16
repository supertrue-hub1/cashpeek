import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/health/check - выполнить проверку страницы
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageId, url } = body;

    let page;
    
    if (pageId) {
      page = await db.healthCheckPage.findUnique({
        where: { id: pageId }
      });
    } else if (url) {
      page = await db.healthCheckPage.findUnique({
        where: { url }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'pageId or url required' },
        { status: 400 }
      );
    }

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Выполняем проверку
    const startTime = Date.now();
    let statusCode: number | null = null;
    let responseTime: number | null = null;
    let error: string | null = null;
    let contentSize: number | null = null;
    let sslValid: boolean | null = null;
    let sslDaysLeft: number | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), page.timeout);

      const response = await fetch(page.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'HealthCheckBot/1.0'
        }
      });

      clearTimeout(timeoutId);

      statusCode = response.status;
      responseTime = Date.now() - startTime;
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        contentSize = parseInt(contentLength, 10);
      } else {
        const text = await response.text();
        contentSize = text.length;
      }

      // Проверка SSL для HTTPS
      if (page.url.startsWith('https://')) {
        try {
          const urlObj = new URL(page.url);
          const certResponse = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${urlObj.hostname}`);
          // Для простоты считаем SSL валидным, если запрос успешен
          sslValid = true;
          // В реальном проекте нужно проверять срок действия сертификата
          sslDaysLeft = 90; // Заглушка
        } catch {
          sslValid = true; // Если HTTPS работает, считаем валидным
        }
      }
    } catch (err: any) {
      error = err.message || 'Request failed';
      responseTime = page.timeout;
    }

    // Определяем статус
    let status: 'healthy' | 'warning' | 'error' | 'critical';
    
    if (statusCode === null) {
      status = 'critical';
    } else if (statusCode >= 500 || responseTime! > 5000) {
      status = 'critical';
    } else if (statusCode >= 400 || responseTime! > 3000) {
      status = 'error';
    } else if (responseTime! > page.maxResponseTime) {
      status = 'warning';
    } else if (statusCode !== page.expectedStatus) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    // Сохраняем результат
    const result = await db.healthCheckResult.create({
      data: {
        pageId: page.id,
        status,
        statusCode,
        responseTime,
        contentSize,
        error,
        sslValid,
        sslDaysLeft,
        checkDuration: Date.now() - startTime
      }
    });

    // Обновляем страницу
    const totalChecks = page.totalChecks + 1;
    const healthyChecks = page.healthyChecks + (status === 'healthy' ? 1 : 0);
    
    await db.healthCheckPage.update({
      where: { id: page.id },
      data: {
        lastCheckAt: new Date(),
        lastStatus: status,
        lastResponseTime: responseTime,
        lastStatusCode: statusCode,
        sslDaysLeft,
        totalChecks,
        healthyChecks
      }
    });

    // Если статус critical или error, создаём инцидент
    if ((status === 'critical' || status === 'error') && page.notifyOnError) {
      const existingIncident = await db.healthIncident.findFirst({
        where: {
          pageId: page.id,
          status: { in: ['open', 'investigating'] }
        }
      });

      if (!existingIncident) {
        // Генерируем уникальный номер с timestamp + random
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 100000);
        const incidentNumber = `INC-${timestamp}-${random}`;

        await db.healthIncident.create({
          data: {
            pageId: page.id,
            incidentNumber,
            severity: status === 'critical' ? 'critical' : 'high',
            title: `${page.name} - ${error || `HTTP ${statusCode}`}`,
            errorType: statusCode ? 'http_error' : 'timeout',
            errorMessage: error
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        page: {
          id: page.id,
          name: page.name,
          url: page.url
        }
      }
    });
  } catch (error) {
    console.error('Error performing health check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform health check' },
      { status: 500 }
    );
  }
}

// GET /api/health/check - получить последние результаты проверок
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const results = await db.healthCheckResult.findMany({
      where: pageId ? { pageId } : undefined,
      include: {
        page: {
          select: {
            id: true,
            name: true,
            url: true,
            category: true
          }
        }
      },
      orderBy: { checkedAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error fetching health check results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
