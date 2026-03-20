/**
 * API Route: Google Analytics 4
 * Безопасный прокси для запросов к GA4 Data API
 *
 * GET /api/admin/ga4 - Получить полный отчёт
 * GET /api/admin/ga4?type=overview - Общая статистика
 * GET /api/admin/ga4?type=daily - Данные по дням
 * GET /api/admin/ga4?type=pages - Топ страниц
 * GET /api/admin/ga4?type=events - События
 * GET /api/admin/ga4?type=traffic - Источники трафика
 * GET /api/admin/ga4?type=mfo-clicks - Клики по MFO
 */

import { NextRequest, NextResponse } from 'next/server'
import { ga4Client, GA4ApiError } from '@/lib/google-analytics'

export const dynamic = 'force-dynamic'

/**
 * GET handler
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const startDate = searchParams.get('startDate') || '7daysAgo'
    const endDate = searchParams.get('endDate') || 'yesterday'
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Валидация дат
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Invalid dates', message: 'Укажите startDate и endDate' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'overview': {
        const data = await ga4Client.getOverviewStats(startDate, endDate)
        return NextResponse.json({
          success: true,
          data,
          meta: { type, startDate, endDate, timestamp: new Date().toISOString() },
        })
      }

      case 'daily': {
        const data = await ga4Client.getDailyData(startDate, endDate)
        return NextResponse.json({
          success: true,
          data,
          meta: { type, startDate, endDate, timestamp: new Date().toISOString() },
        })
      }

      case 'pages': {
        const data = await ga4Client.getTopPages(startDate, endDate, limit)
        return NextResponse.json({
          success: true,
          data,
          meta: { type, startDate, endDate, limit, timestamp: new Date().toISOString() },
        })
      }

      case 'events': {
        const data = await ga4Client.getEvents(startDate, endDate, limit)
        return NextResponse.json({
          success: true,
          data,
          meta: { type, startDate, endDate, limit, timestamp: new Date().toISOString() },
        })
      }

      case 'event': {
        const eventName = searchParams.get('eventName')
        if (!eventName) {
          return NextResponse.json(
            { error: 'Missing eventName', message: 'Укажите параметр eventName' },
            { status: 400 }
          )
        }
        const data = await ga4Client.getEventByName(eventName, startDate, endDate)
        return NextResponse.json({
          success: true,
          data,
          meta: { type, eventName, startDate, endDate, timestamp: new Date().toISOString() },
        })
      }

      case 'traffic': {
        const data = await ga4Client.getTrafficSources(startDate, endDate, limit)
        return NextResponse.json({
          success: true,
          data,
          meta: { type, startDate, endDate, limit, timestamp: new Date().toISOString() },
        })
      }

      case 'mfo-clicks': {
        const data = await ga4Client.getMfoClicksByPage(startDate, endDate, limit)
        return NextResponse.json({
          success: true,
          data,
          meta: { type, startDate, endDate, limit, timestamp: new Date().toISOString() },
        })
      }

      case 'all':
      default: {
        const data = await ga4Client.getDashboardReport(startDate, endDate)
        return NextResponse.json({
          success: true,
          data,
          meta: { type: 'all', startDate, endDate, timestamp: new Date().toISOString() },
        })
      }
    }
  } catch (error) {
    console.error('[GA4 API Error]:', error)

    if (error instanceof GA4ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: 'GA4ApiError',
          message: error.message,
          code: error.code,
        },
        { status: error.code >= 400 && error.code < 500 ? error.code : 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'InternalServerError',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 }
    )
  }
}
