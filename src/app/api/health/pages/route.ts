import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/health/pages - получить список страниц для мониторинга
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const active = searchParams.get('active');

    const where: any = {};
    
    if (category) where.category = category;
    if (status) where.lastStatus = status;
    if (active !== null) where.isActive = active === 'true';

    const pages = await db.healthCheckPage.findMany({
      where,
      include: {
        _count: {
          select: { incidents: true }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { name: 'asc' }
      ]
    });

    // Статистика
    const stats = {
      total: pages.length,
      healthy: pages.filter(p => p.lastStatus === 'healthy').length,
      warning: pages.filter(p => p.lastStatus === 'warning').length,
      error: pages.filter(p => p.lastStatus === 'error').length,
      critical: pages.filter(p => p.lastStatus === 'critical').length,
      unknown: pages.filter(p => p.lastStatus === 'unknown').length
    };

    return NextResponse.json({
      success: true,
      pages,
      stats
    });
  } catch (error) {
    console.error('Error fetching health pages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/health/pages - добавить новую страницу для мониторинга
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      url,
      name,
      category = 'main',
      checkInterval = 300,
      timeout = 30000,
      priority = 3,
      expectedStatus = 200,
      maxResponseTime = 1000,
      notifyOnError = true,
      notifyOnWarning = true
    } = body;

    // Проверяем, не существует ли уже такая страница
    const existing = await db.healthCheckPage.findUnique({
      where: { url }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Page already exists' },
        { status: 400 }
      );
    }

    const page = await db.healthCheckPage.create({
      data: {
        url,
        name,
        category,
        checkInterval,
        timeout,
        priority,
        expectedStatus,
        maxResponseTime,
        notifyOnError,
        notifyOnWarning
      }
    });

    return NextResponse.json({
      success: true,
      page
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating health page:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
