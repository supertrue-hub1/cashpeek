import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncOffers, getSyncHistory, getOffersCountBySource } from '@/lib/sync/service';

// GET /api/sync - получить статус и историю синхронизации
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    // Получить историю синхронизаций
    if (action === 'history') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const history = await getSyncHistory(limit);
      return NextResponse.json(history);
    }
    
    // Получить статистику источников
    if (action === 'stats') {
      const click2MoneyCount = await getOffersCountBySource('api-traffic-handler.click2.money');
      const leadsSuCount = await getOffersCountBySource('Leads.su');
      
      return NextResponse.json({
        'api-traffic-handler.click2.money': click2MoneyCount,
        'Leads.su': leadsSuCount,
      });
    }
    
    // По умолчанию - получить историю
    const history = await getSyncHistory(10);
    return NextResponse.json(history);
  } catch (error) {
    console.error('[API /api/sync] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync data' },
      { status: 500 }
    );
  }
}

// POST /api/sync - запустить синхронизацию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source } = body;
    
    // Определяем источник
    let sourceKey: 'click2money' | 'leads.su';
    
    if (source === 'click2money' || source === 'api-traffic-handler.click2.money') {
      sourceKey = 'click2money';
    } else if (source === 'leads.su' || source === 'Leads.su') {
      sourceKey = 'leads.su';
    } else {
      // Синхронизируем все источники
      const results = [];
      
      // Пробуем click2money
      try {
        const result = await syncOffers('click2money');
        results.push(result);
      } catch (e) {
        console.error('[Sync] click2money error:', e);
      }
      
      // Пробуем leads.su
      try {
        const result = await syncOffers('leads.su');
        results.push(result);
      } catch (e) {
        console.error('[Sync] leads.su error:', e);
      }
      
      return NextResponse.json({
        success: results.some(r => r.success),
        results,
      });
    }
    
    // Синхронизируем конкретный источник
    const result = await syncOffers(sourceKey);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/sync] Error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
