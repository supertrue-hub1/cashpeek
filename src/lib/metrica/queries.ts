/**
 * Готовые запросы к Яндекс.Метрике
 * Возвращают типизированные данные для UI компонентов
 */

import { metricaClient } from './client'
import {
  VisitsStats,
  PeriodStats,
  TopPage,
  TrafficSource,
  DailyStats,
  GoalConversion,
  MetricaDashboardReport,
  VISIT_METRICS,
  TRAFFIC_DIMENSIONS,
  PAGE_DIMENSIONS,
  MetricaApiError,
} from './types'

// ============================================
// Helpers
// ============================================

/**
 * Безопасное получение числа из ответа
 */
function safeNumber(value: number | undefined | null, defaultValue = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue
}

/**
 * Форматирование даты для API
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Получить дату N дней назад
 */
function getDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDate(date)
}

/**
 * Получить относительную дату
 */
function getRelativeDate(daysAgo: number): string {
  if (daysAgo === 0) return 'today'
  if (daysAgo === 1) return 'yesterday'
  return `${daysAgo}daysAgo`
}

// ============================================
// Queries
// ============================================

/**
 * Получить общую статистику визитов за период
 */
export async function getVisitsStats(
  days: number = 7
): Promise<PeriodStats | null> {
  try {
    const response = await metricaClient.query({
      metrics: [
        VISIT_METRICS.visits,
        VISIT_METRICS.pageviews,
        VISIT_METRICS.users,
        VISIT_METRICS.newUsers,
        VISIT_METRICS.bounceRate,
        VISIT_METRICS.pageDepth,
        VISIT_METRICS.avgVisitDurationSeconds,
      ].join(','),
      date1: getRelativeDate(days),
      date2: 'today',
      accuracy: 'full',
    })

    if (!response.data || response.data.length === 0) {
      return null
    }

    const totals = response.totals

    return {
      visits: safeNumber(totals[0]),
      pageviews: safeNumber(totals[1]),
      visitors: safeNumber(totals[2]),
      newVisitors: safeNumber(totals[3]),
      bounceRate: safeNumber(totals[4]),
      pageDepth: safeNumber(totals[5]),
      avgVisitDurationSeconds: safeNumber(totals[6]),
      period: {
        date1: getDaysAgo(days),
        date2: formatDate(new Date()),
      },
    }
  } catch (error) {
    console.error('Error fetching visits stats:', error)
    return null
  }
}

/**
 * Получить топ страниц по посещаемости
 */
export async function getTopPages(
  days: number = 7,
  limit: number = 10
): Promise<TopPage[]> {
  try {
    const response = await metricaClient.query({
      metrics: [
        'ym:pv:pageviews',
        'ym:pv:avgTimeOnPage',
        'ym:pv:bounceRate',
      ].join(','),
      dimensions: [PAGE_DIMENSIONS.url, PAGE_DIMENSIONS.title].join(','),
      date1: getRelativeDate(days),
      date2: 'today',
      sort: '-ym:pv:pageviews', // Сортировка по убыванию просмотров
      limit,
      accuracy: 'full',
    })

    if (!response.data || response.data.length === 0) {
      return []
    }

    const totalViews = safeNumber(response.totals[0])

    return response.data.map((item) => ({
      url: item.dimensions[0]?.name || '',
      title: item.dimensions[1]?.name || undefined,
      views: safeNumber(item.metrics[0]),
      visits: safeNumber(item.metrics[0]), // Приближенно
      avgTime: safeNumber(item.metrics[1]),
      bounceRate: safeNumber(item.metrics[2]),
      share: totalViews > 0 ? (safeNumber(item.metrics[0]) / totalViews) * 100 : 0,
    }))
  } catch (error) {
    console.error('Error fetching top pages:', error)
    return []
  }
}

/**
 * Получить источники трафика
 */
export async function getTrafficSources(
  days: number = 7,
  limit: number = 10
): Promise<TrafficSource[]> {
  try {
    const response = await metricaClient.query({
      metrics: [
        VISIT_METRICS.visits,
        VISIT_METRICS.pageviews,
        VISIT_METRICS.users,
        VISIT_METRICS.bounceRate,
      ].join(','),
      dimensions: TRAFFIC_DIMENSIONS.source,
      date1: getRelativeDate(days),
      date2: 'today',
      sort: `-${VISIT_METRICS.visits}`,
      limit,
      accuracy: 'full',
    })

    if (!response.data || response.data.length === 0) {
      return []
    }

    const totalVisits = safeNumber(response.totals[0])

    // Маппинг названий источников
    const sourceNames: Record<string, string> = {
      'direct_traffic': 'Прямой трафик',
      'internal_traffic': 'Внутренний трафик',
      'search_engine_traffic': 'Поисковый трафик',
      'ad_traffic': 'Рекламный трафик',
      'social_network_traffic': 'Социальные сети',
      'email_traffic': 'Email',
      'ads_traffic': 'Рекламные системы',
      'link_traffic': 'Переходы по ссылкам',
    }

    return response.data.map((item) => {
      const sourceId = item.dimensions[0]?.id || 'unknown'
      return {
        source: sourceId,
        name: sourceNames[sourceId] || item.dimensions[0]?.name || sourceId,
        visits: safeNumber(item.metrics[0]),
        pageviews: safeNumber(item.metrics[1]),
        visitors: safeNumber(item.metrics[2]),
        bounceRate: safeNumber(item.metrics[3]),
        share: totalVisits > 0 ? (safeNumber(item.metrics[0]) / totalVisits) * 100 : 0,
      }
    })
  } catch (error) {
    console.error('Error fetching traffic sources:', error)
    return []
  }
}

/**
 * Получить статистику по дням
 */
export async function getDailyStats(
  days: number = 7
): Promise<DailyStats[]> {
  try {
    const response = await metricaClient.query({
      metrics: [
        VISIT_METRICS.visits,
        VISIT_METRICS.pageviews,
        VISIT_METRICS.users,
      ].join(','),
      dimensions: 'ym:s:date',
      date1: getRelativeDate(days),
      date2: 'today',
      sort: 'ym:s:date',
      group: 'day',
      accuracy: 'full',
    })

    if (!response.data || response.data.length === 0) {
      return []
    }

    return response.data.map((item) => ({
      date: item.dimensions[0]?.name || '',
      visits: safeNumber(item.metrics[0]),
      pageviews: safeNumber(item.metrics[1]),
      visitors: safeNumber(item.metrics[2]),
    }))
  } catch (error) {
    console.error('Error fetching daily stats:', error)
    return []
  }
}

/**
 * Получить конверсии по целям
 * @param goalIds - массив ID целей (если пусто, вернет все цели)
 */
export async function getGoalConversions(
  days: number = 7,
  goalIds: string[] = []
): Promise<GoalConversion[]> {
  try {
    // Если не указаны цели, получаем базовую конверсию
    // Для реального использования нужно знать ID целей из настроек счетчика
    const metrics = goalIds.length > 0
      ? goalIds.map(id => `ym:s:goal${id}reaches`).join(',')
      : 'ym:s:goalReaches' // Общая конверсия

    const response = await metricaClient.query({
      metrics: [
        metrics,
        VISIT_METRICS.visits,
      ].join(','),
      dimensions: goalIds.length > 0 ? 'ym:s:goalName' : undefined,
      date1: getRelativeDate(days),
      date2: 'today',
      accuracy: 'full',
    })

    if (!response.data || response.data.length === 0) {
      return []
    }

    const totalVisits = safeNumber(response.totals[1])

    return response.data.map((item, index) => ({
      goalId: item.dimensions[0]?.id || `goal-${index}`,
      goalName: item.dimensions[0]?.name || 'Цель',
      reaches: safeNumber(item.metrics[0]),
      conversions: totalVisits > 0 ? (safeNumber(item.metrics[0]) / totalVisits) * 100 : 0,
      visits: totalVisits,
    }))
  } catch (error) {
    console.error('Error fetching goal conversions:', error)
    return []
  }
}

/**
 * Получить глубину просмотра
 */
export async function getPageDepth(days: number = 7): Promise<number> {
  try {
    const response = await metricaClient.query({
      metrics: VISIT_METRICS.pageDepth,
      date1: getRelativeDate(days),
      date2: 'today',
      accuracy: 'full',
    })

    if (!response.data || response.data.length === 0) {
      return 0
    }

    return safeNumber(response.totals[0])
  } catch (error) {
    console.error('Error fetching page depth:', error)
    return 0
  }
}

/**
 * Получить полный отчёт для дашборда
 * Комбинирует все запросы в один вызов
 */
export async function getDashboardReport(
  days: number = 7
): Promise<MetricaDashboardReport> {
  try {
    // Параллельные запросы
    const [visits, topPages, trafficSources, dailyStats, goalConversions] = await Promise.all([
      getVisitsStats(days),
      getTopPages(days, 10),
      getTrafficSources(days, 10),
      getDailyStats(days),
      getGoalConversions(days),
    ])

    const hasData = !!(visits || topPages.length > 0 || trafficSources.length > 0)

    return {
      visits: visits || {
        visits: 0,
        pageviews: 0,
        visitors: 0,
        newVisitors: 0,
        bounceRate: 0,
        pageDepth: 0,
        avgVisitDurationSeconds: 0,
        period: {
          date1: getDaysAgo(days),
          date2: formatDate(new Date()),
        },
      },
      topPages,
      trafficSources,
      dailyStats,
      goalConversions,
      lastUpdated: new Date().toISOString(),
      hasData,
    }
  } catch (error) {
    console.error('Error fetching dashboard report:', error)
    throw error instanceof MetricaApiError
      ? error
      : new MetricaApiError('Ошибка получения данных из Метрики', 500)
  }
}

// ============================================
// Экспорт для удобства
// ============================================

export const metricaQueries = {
  getVisitsStats,
  getTopPages,
  getTrafficSources,
  getDailyStats,
  getGoalConversions,
  getPageDepth,
  getDashboardReport,
}
