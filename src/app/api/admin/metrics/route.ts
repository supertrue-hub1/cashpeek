/**
 * API Route: Яндекс.Метрика
 * Безопасный прокси для запросов к API Метрики
 *
 * GET /api/admin/metrics - Получить данные для дашборда
 * GET /api/admin/metrics?type=visits - Получить только визиты
 * GET /api/admin/metrics?type=top-pages - Получить топ страниц
 * GET /api/admin/metrics?type=traffic - Получить источники трафика
 * GET /api/admin/metrics?type=daily - Получить статистику по дням
 * GET /api/admin/metrics?type=goals - Получить конверсии по целям
 */

import { NextRequest, NextResponse } from 'next/server'
import { metricaQueries } from '@/lib/metrica/queries'
import { MetricaApiError } from '@/lib/metrica/types'

/**
 * Проверка авторизации
 * В реальном проекте нужно проверять сессию пользователя
 */
async function checkAuth(request: NextRequest): Promise<boolean> {
  // TODO: Добавить проверку сессии через NextAuth
  // const session = await getServerSession(authOptions)
  // return !!session && ['admin', 'editor'].includes(session.user?.role)
  return true // Временно разрешаем все запросы
}

/**
 * GET handler
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации
    const isAuthorized = await checkAuth(request)
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    // Параметры запроса
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const days = parseInt(searchParams.get('days') || '7', 10)

    // Валидация периода
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Invalid period', message: 'Период должен быть от 1 до 365 дней' },
        { status: 400 }
      )
    }

    // Выбор типа данных
    switch (type) {
      case 'visits': {
        const data = await metricaQueries.getVisitsStats(days)
        return NextResponse.json({
          success: true,
          data,
          meta: {
            type,
            days,
            timestamp: new Date().toISOString(),
          },
        })
      }

      case 'top-pages': {
        const limit = parseInt(searchParams.get('limit') || '10', 10)
        const data = await metricaQueries.getTopPages(days, limit)
        return NextResponse.json({
          success: true,
          data,
          meta: {
            type,
            days,
            limit,
            timestamp: new Date().toISOString(),
          },
        })
      }

      case 'traffic': {
        const limit = parseInt(searchParams.get('limit') || '10', 10)
        const data = await metricaQueries.getTrafficSources(days, limit)
        return NextResponse.json({
          success: true,
          data,
          meta: {
            type,
            days,
            limit,
            timestamp: new Date().toISOString(),
          },
        })
      }

      case 'daily': {
        const data = await metricaQueries.getDailyStats(days)
        return NextResponse.json({
          success: true,
          data,
          meta: {
            type,
            days,
            timestamp: new Date().toISOString(),
          },
        })
      }

      case 'goals': {
        const goalIds = searchParams.get('goalIds')?.split(',').filter(Boolean) || []
        const data = await metricaQueries.getGoalConversions(days, goalIds)
        return NextResponse.json({
          success: true,
          data,
          meta: {
            type,
            days,
            goalIds,
            timestamp: new Date().toISOString(),
          },
        })
      }

      case 'all':
      default: {
        const data = await metricaQueries.getDashboardReport(days)
        return NextResponse.json({
          success: true,
          data,
          meta: {
            type: 'all',
            days,
            timestamp: new Date().toISOString(),
          },
        })
      }
    }
  } catch (error) {
    console.error('[Metrica API Error]:', error)

    // Обработка ошибок API Метрики
    if (error instanceof MetricaApiError) {
      return NextResponse.json(
        {
          success: false,
          error: 'MetricaApiError',
          message: error.message,
          code: error.code,
          details: error.details,
        },
        { status: error.code >= 400 && error.code < 500 ? error.code : 500 }
      )
    }

    // Общие ошибки
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

/**
 * Настройки кэширования
 * Next.js будет кэшировать ответы на основе настроек в metricaClient
 */
export const revalidate = 900 // 15 минут
