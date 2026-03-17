import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Конфигурация
const CONFIG = {
  BATCH_SIZE: 50,
  REQUEST_TIMEOUT_MS: 5000,
  DELAY_BETWEEN_REQUESTS_MS: 100,
};

const BROKEN_STATUS_CODES = [0, 400, 401, 404, 405, 410, 500, 502, 503, 504];

/**
 * Проверка одной ссылки
 */
async function checkUrl(url: string) {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    
    return {
      statusCode: response.status,
      responseTime: Date.now() - startTime,
      isBroken: BROKEN_STATUS_CODES.includes(response.status),
      errorType: null,
    };
  } catch (error) {
    return {
      statusCode: null,
      responseTime: Date.now() - startTime,
      isBroken: true,
      errorType: error instanceof Error ? error.name : 'unknown',
    };
  }
}

/**
 * GET /api/admin/link-checker - получить битые ссылки
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Проверка прав (только admin и editor)
  if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status'); // 'broken', 'all', 'fixed'
  const source = searchParams.get('source'); // sync source filter
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const where: any = {
    affiliateUrl: { not: null },
  };
  
  if (status === 'broken') {
    where.isBroken = true;
    where.ignoreBroken = false;
  } else if (status === 'fixed') {
    where.isBroken = false;
  }
  
  if (source) {
    where.syncSource = source;
  }
  
  try {
    const [offers, total, stats] = await Promise.all([
      prisma.loanOffer.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          affiliateUrl: true,
          syncSource: true,
          isBroken: true,
          lastChecked: true,
          httpStatus: true,
          brokenSince: true,
          brokenReason: true,
          ignoreBroken: true,
          status: true,
        },
        orderBy: { lastChecked: 'asc' },
        take: Math.min(limit, 100),
        skip: offset,
      }),
      prisma.loanOffer.count({ where }),
      prisma.loanOffer.groupBy({
        by: ['syncSource', 'isBroken'],
        _count: true,
        where: { affiliateUrl: { not: null } },
      }),
    ]);
    
    return NextResponse.json({
      offers,
      total,
      stats,
      pagination: { limit, offset, hasMore: offset + offers.length < total },
    });
  } catch (error) {
    console.error('Link checker GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/link-checker - запустить проверку
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { offerIds, checkAll = false } = body;
    
    let offersToCheck;
    
    if (checkAll) {
      // Проверить все офферы с ссылками
      offersToCheck = await prisma.loanOffer.findMany({
        where: {
          affiliateUrl: { not: null },
          status: { not: 'archived' },
        },
        select: {
          id: true,
          name: true,
          affiliateUrl: true,
          isBroken: true,
        },
        take: CONFIG.BATCH_SIZE,
      });
    } else if (offerIds?.length > 0) {
      // Проверить конкретные офферы
      offersToCheck = await prisma.loanOffer.findMany({
        where: {
          id: { in: offerIds },
          affiliateUrl: { not: null },
        },
        select: {
          id: true,
          name: true,
          affiliateUrl: true,
          isBroken: true,
        },
      });
    } else {
      return NextResponse.json({ error: 'No offers specified' }, { status: 400 });
    }
    
    const results = [];
    let brokenCount = 0;
    let fixedCount = 0;
    
    for (const offer of offersToCheck) {
      const result = await checkUrl(offer.affiliateUrl!);
      
      // Логируем
      await prisma.linkCheckLog.create({
        data: {
          offerId: offer.id,
          url: offer.affiliateUrl!,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          isBroken: result.isBroken,
          errorType: result.errorType,
        },
      });
      
      // Обновляем оффер
      const wasBroken = offer.isBroken;
      
      await prisma.loanOffer.update({
        where: { id: offer.id },
        data: {
          lastChecked: new Date(),
          httpStatus: result.statusCode,
          isBroken: result.isBroken,
          brokenSince: result.isBroken && !wasBroken ? new Date() : null,
          brokenReason: result.isBroken ? (result.errorType || `HTTP ${result.statusCode}`) : null,
          status: !result.isBroken && wasBroken ? 'published' : undefined,
        },
      });
      
      if (result.isBroken) {
        brokenCount++;
        if (!wasBroken) {
          results.push({ offer: offer.name, status: 'now_broken' });
        }
      } else if (wasBroken) {
        fixedCount++;
        results.push({ offer: offer.name, status: 'fixed' });
      }
      
      // Пауза между запросами
      await new Promise(r => setTimeout(r, CONFIG.DELAY_BETWEEN_REQUESTS_MS));
    }
    
    return NextResponse.json({
      success: true,
      checked: offersToCheck.length,
      broken: brokenCount,
      fixed: fixedCount,
      results: results.slice(0, 20), // Первые 20 изменений
    });
  } catch (error) {
    console.error('Link checker POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/link-checker - обновить настройки (ignore)
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { offerId, ignoreBroken, status } = body;
    
    if (!offerId) {
      return NextResponse.json({ error: 'offerId required' }, { status: 400 });
    }
    
    const updateData: any = {};
    if (typeof ignoreBroken === 'boolean') {
      updateData.ignoreBroken = ignoreBroken;
    }
    if (status) {
      updateData.status = status;
    }
    
    const offer = await prisma.loanOffer.update({
      where: { id: offerId },
      data: updateData,
      select: { id: true, name: true, ignoreBroken: true, status: true },
    });
    
    return NextResponse.json({ success: true, offer });
  } catch (error) {
    console.error('Link checker PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
