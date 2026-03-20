/**
 * Google Analytics 4 API Client
 * С кэшированием и обработкой ошибок
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { unstable_cache } from 'next/cache'
import {
  GA4Config,
  GA4Credentials,
  GA4ApiError,
  GA4_METRICS,
  GA4_DIMENSIONS,
} from './types'

// ============================================
// Configuration
// ============================================

function getConfig(): GA4Config {
  const propertyId = process.env.GA4_PROPERTY_ID
  const credentialsJson = process.env.GA4_CREDENTIALS

  console.log('[GA4 Config] Checking environment variables...', {
    hasPropertyId: !!propertyId,
    hasCredentials: !!credentialsJson,
    credentialsLength: credentialsJson?.length || 0,
  })

  if (!propertyId) {
    throw new GA4ApiError('GA4_PROPERTY_ID не настроен. Добавьте GA4_PROPERTY_ID в .env', 401)
  }

  if (!credentialsJson) {
    throw new GA4ApiError('GA4_CREDENTIALS не настроен. Добавьте GA4_CREDENTIALS в .env', 401)
  }

  let credentials: GA4Credentials
  try {
    credentials = JSON.parse(credentialsJson)
    console.log('[GA4 Config] Credentials parsed successfully', {
      hasClientEmail: !!credentials.client_email,
      hasPrivateKey: !!credentials.private_key,
    })
  } catch (parseError) {
    console.error('[GA4 Config] Failed to parse credentials:', parseError)
    throw new GA4ApiError(
      'GA4_CREDENTIALS содержит невалидный JSON. Проверьте формат: {"type":"service_account",...}',
      400
    )
  }

  if (!credentials.client_email) {
    throw new GA4ApiError('GA4_CREDENTIALS не содержит client_email', 400)
  }

  if (!credentials.private_key) {
    throw new GA4ApiError('GA4_CREDENTIALS не содержит private_key', 400)
  }

  return { propertyId, credentials }
}

// ============================================
// Client Singleton
// ============================================

let analyticsClient: BetaAnalyticsDataClient | null = null

function getClient(): BetaAnalyticsDataClient {
  if (analyticsClient) return analyticsClient

  const { propertyId, credentials } = getConfig()
  
  console.log('[GA4 Client] Creating client for property:', propertyId)
  
  analyticsClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  })

  console.log('[GA4 Client] Client created successfully')
  return analyticsClient
}

// ============================================
// In-memory Cache
// ============================================

const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

function setToCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
}

// ============================================
// Helper Functions
// ============================================

function safeNumber(value: string | undefined, defaultValue = 0): number {
  if (!value) return defaultValue
  const num = parseFloat(value)
  return isNaN(num) ? defaultValue : num
}

function formatDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0].replace(/-/g, '') // YYYYMMDD
}

function formatDisplayDate(dateStr: string): string {
  // YYYYMMDD -> YYYY-MM-DD
  if (dateStr.length === 8) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  }
  return dateStr
}

// ============================================
// Core Query Function
// ============================================

interface RunReportParams {
  metrics: string[]
  dimensions?: string[]
  dateRange?: { startDate: string; endDate: string }
  dimensionFilter?: {
    filter: {
      fieldName: string
      stringFilter?: { matchType: string; value: string }
      inListFilter?: { values: string[] }
    }
  }
  limit?: number
  offset?: number
  orderBys?: Array<{ metric: { metricName: string }; desc: boolean }>
}

async function runReport(params: RunReportParams) {
  const client = getClient()
  const { propertyId } = getConfig()

  console.log('[GA4 Report] Running report:', {
    property: `properties/${propertyId}`,
    metrics: params.metrics,
    dimensions: params.dimensions,
    dateRange: params.dateRange,
  })

  try {
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: params.dateRange?.startDate || '7daysAgo',
          endDate: params.dateRange?.endDate || 'yesterday',
        },
      ],
      metrics: params.metrics.map((m) => ({ name: m })),
      dimensions: params.dimensions?.map((d) => ({ name: d })),
      dimensionFilter: params.dimensionFilter,
      limit: params.limit || 100,
      offset: params.offset,
      orderBys: params.orderBys,
    })

    console.log('[GA4 Report] Success, rows:', response.rows?.length || 0)
    return response
  } catch (error) {
    console.error('[GA4 Report] Error:', error)
    throw error
  }
}

// ============================================
// Cached Query Functions
// ============================================

const CACHE_TTL = 4 * 60 * 60 * 1000 // 4 часа

/**
 * Получить общую статистику за период
 */
export async function getOverviewStats(
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday'
) {
  const cacheKey = `ga4-overview-${startDate}-${endDate}`
  const cached = getFromCache<ReturnType<typeof fetchOverview>>(cacheKey)
  if (cached) return cached

  const data = await fetchOverview(startDate, endDate)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchOverview(startDate: string, endDate: string) {
  try {
    const response = await runReport({
      metrics: [
        GA4_METRICS.users,
        GA4_METRICS.newUsers,
        GA4_METRICS.sessions,
        GA4_METRICS.pageviews,
        GA4_METRICS.sessionDuration,
        GA4_METRICS.bounceRate,
        GA4_METRICS.events,
      ],
      dateRange: { startDate, endDate },
    })

    const totals = response.rows?.[0]?.metricValues || []

    return {
      users: safeNumber(totals[0]?.value),
      newUsers: safeNumber(totals[1]?.value),
      sessions: safeNumber(totals[2]?.value),
      pageviews: safeNumber(totals[3]?.value),
      avgSessionDuration: safeNumber(totals[4]?.value),
      bounceRate: safeNumber(totals[5]?.value),
      events: safeNumber(totals[6]?.value),
    }
  } catch (error) {
    console.error('[GA4 Error] getOverviewStats:', error)
    throw error instanceof GA4ApiError
      ? error
      : new GA4ApiError('Ошибка получения статистики', 500)
  }
}

/**
 * Получить данные по дням
 */
export async function getDailyData(
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday'
) {
  const cacheKey = `ga4-daily-${startDate}-${endDate}`
  const cached = getFromCache<ReturnType<typeof fetchDailyData>>(cacheKey)
  if (cached) return cached

  const data = await fetchDailyData(startDate, endDate)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchDailyData(startDate: string, endDate: string) {
  try {
    const response = await runReport({
      metrics: [
        GA4_METRICS.users,
        GA4_METRICS.sessions,
        GA4_METRICS.pageviews,
        GA4_METRICS.events,
      ],
      dimensions: [GA4_DIMENSIONS.date],
      dateRange: { startDate, endDate },
      orderBys: [{ metric: { metricName: GA4_METRICS.users }, desc: false }],
    })

    return (response.rows || []).map((row) => ({
      date: formatDisplayDate(row.dimensionValues[0]?.value || ''),
      users: safeNumber(row.metricValues[0]?.value),
      sessions: safeNumber(row.metricValues[1]?.value),
      pageviews: safeNumber(row.metricValues[2]?.value),
      events: safeNumber(row.metricValues[3]?.value),
    }))
  } catch (error) {
    console.error('[GA4 Error] getDailyData:', error)
    return []
  }
}

/**
 * Получить топ страниц
 */
export async function getTopPages(
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday',
  limit: number = 10
) {
  const cacheKey = `ga4-pages-${startDate}-${endDate}-${limit}`
  const cached = getFromCache<ReturnType<typeof fetchTopPages>>(cacheKey)
  if (cached) return cached

  const data = await fetchTopPages(startDate, endDate, limit)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchTopPages(startDate: string, endDate: string, limit: number) {
  try {
    const response = await runReport({
      metrics: [
        GA4_METRICS.pageviews,
        GA4_METRICS.users,
        GA4_METRICS.sessionDuration,
      ],
      dimensions: [GA4_DIMENSIONS.pagePath, GA4_DIMENSIONS.pageTitle],
      dateRange: { startDate, endDate },
      limit,
      orderBys: [{ metric: { metricName: GA4_METRICS.pageviews }, desc: true }],
    })

    const totalPageviews = response.rows?.reduce(
      (sum, row) => sum + safeNumber(row.metricValues[0]?.value),
      0
    ) || 1

    return (response.rows || []).map((row) => ({
      path: row.dimensionValues[0]?.value || '',
      title: row.dimensionValues[1]?.value || undefined,
      pageviews: safeNumber(row.metricValues[0]?.value),
      users: safeNumber(row.metricValues[1]?.value),
      avgTimeOnPage: safeNumber(row.metricValues[2]?.value),
      bounceRate: 0, // GA4 считает по-другому
      share: (safeNumber(row.metricValues[0]?.value) / totalPageviews) * 100,
    }))
  } catch (error) {
    console.error('[GA4 Error] getTopPages:', error)
    return []
  }
}

/**
 * Получить события (особенно click_mfo_button)
 */
export async function getEvents(
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday',
  limit: number = 20
) {
  const cacheKey = `ga4-events-${startDate}-${endDate}-${limit}`
  const cached = getFromCache<ReturnType<typeof fetchEvents>>(cacheKey)
  if (cached) return cached

  const data = await fetchEvents(startDate, endDate, limit)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchEvents(startDate: string, endDate: string, limit: number) {
  try {
    const response = await runReport({
      metrics: [
        GA4_METRICS.events,
        GA4_METRICS.users,
        GA4_METRICS.eventValue,
      ],
      dimensions: [GA4_DIMENSIONS.eventName],
      dateRange: { startDate, endDate },
      limit,
      orderBys: [{ metric: { metricName: GA4_METRICS.events }, desc: true }],
    })

    const totalEvents = response.rows?.reduce(
      (sum, row) => sum + safeNumber(row.metricValues[0]?.value),
      0
    ) || 1

    return (response.rows || []).map((row) => ({
      eventName: row.dimensionValues[0]?.value || '',
      eventCount: safeNumber(row.metricValues[0]?.value),
      eventUsers: safeNumber(row.metricValues[1]?.value),
      avgEventValue: safeNumber(row.metricValues[2]?.value),
      share: (safeNumber(row.metricValues[0]?.value) / totalEvents) * 100,
    }))
  } catch (error) {
    console.error('[GA4 Error] getEvents:', error)
    return []
  }
}

/**
 * Получить конкретное событие (например, click_mfo_button)
 */
export async function getEventByName(
  eventName: string,
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday'
) {
  const cacheKey = `ga4-event-${eventName}-${startDate}-${endDate}`
  const cached = getFromCache<ReturnType<typeof fetchEventByName>>(cacheKey)
  if (cached) return cached

  const data = await fetchEventByName(eventName, startDate, endDate)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchEventByName(eventName: string, startDate: string, endDate: string) {
  try {
    const response = await runReport({
      metrics: [
        GA4_METRICS.events,
        GA4_METRICS.users,
      ],
      dimensions: [GA4_DIMENSIONS.eventName],
      dateRange: { startDate, endDate },
      dimensionFilter: {
        filter: {
          fieldName: GA4_DIMENSIONS.eventName,
          stringFilter: { matchType: 'EXACT', value: eventName },
        },
      },
    })

    const row = response.rows?.[0]
    return {
      eventName,
      eventCount: safeNumber(row?.metricValues[0]?.value),
      eventUsers: safeNumber(row?.metricValues[1]?.value),
    }
  } catch (error) {
    console.error('[GA4 Error] getEventByName:', error)
    return { eventName, eventCount: 0, eventUsers: 0 }
  }
}

/**
 * Получить MFO клики (событие click_mfo_button) по страницам
 */
export async function getMfoClicksByPage(
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday',
  limit: number = 10
) {
  const cacheKey = `ga4-mfo-clicks-page-${startDate}-${endDate}-${limit}`
  const cached = getFromCache<ReturnType<typeof fetchMfoClicksByPage>>(cacheKey)
  if (cached) return cached

  const data = await fetchMfoClicksByPage(startDate, endDate, limit)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchMfoClicksByPage(startDate: string, endDate: string, limit: number) {
  try {
    const response = await runReport({
      metrics: [GA4_METRICS.events],
      dimensions: [GA4_DIMENSIONS.pagePath, GA4_DIMENSIONS.eventName],
      dateRange: { startDate, endDate },
      dimensionFilter: {
        filter: {
          fieldName: GA4_DIMENSIONS.eventName,
          stringFilter: { matchType: 'EXACT', value: 'click_mfo_button' },
        },
      },
      limit,
      orderBys: [{ metric: { metricName: GA4_METRICS.events }, desc: true }],
    })

    return (response.rows || []).map((row) => ({
      page: row.dimensionValues[0]?.value || '',
      clicks: safeNumber(row.metricValues[0]?.value),
    }))
  } catch (error) {
    console.error('[GA4 Error] getMfoClicksByPage:', error)
    return []
  }
}

/**
 * Получить источники трафика
 */
export async function getTrafficSources(
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday',
  limit: number = 10
) {
  const cacheKey = `ga4-traffic-${startDate}-${endDate}-${limit}`
  const cached = getFromCache<ReturnType<typeof fetchTrafficSources>>(cacheKey)
  if (cached) return cached

  const data = await fetchTrafficSources(startDate, endDate, limit)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchTrafficSources(startDate: string, endDate: string, limit: number) {
  try {
    const response = await runReport({
      metrics: [
        GA4_METRICS.users,
        GA4_METRICS.sessions,
        GA4_METRICS.newUsers,
      ],
      dimensions: [GA4_DIMENSIONS.sourceMedium],
      dateRange: { startDate, endDate },
      limit,
      orderBys: [{ metric: { metricName: GA4_METRICS.users }, desc: true }],
    })

    const totalUsers = response.rows?.reduce(
      (sum, row) => sum + safeNumber(row.metricValues[0]?.value),
      0
    ) || 1

    return (response.rows || []).map((row) => {
      const sourceMedium = row.dimensionValues[0]?.value || ''
      const [source, medium] = sourceMedium.split(' / ')

      return {
        source: source || '(direct)',
        medium: medium || '(none)',
        sourceMedium,
        users: safeNumber(row.metricValues[0]?.value),
        sessions: safeNumber(row.metricValues[1]?.value),
        newUsers: safeNumber(row.metricValues[2]?.value),
        share: (safeNumber(row.metricValues[0]?.value) / totalUsers) * 100,
      }
    })
  } catch (error) {
    console.error('[GA4 Error] getTrafficSources:', error)
    return []
  }
}

/**
 * Получить полный отчёт для дашборда
 */
export async function getDashboardReport(
  startDate: string = '7daysAgo',
  endDate: string = 'yesterday'
) {
  const cacheKey = `ga4-dashboard-${startDate}-${endDate}`
  const cached = getFromCache<ReturnType<typeof fetchDashboardReport>>(cacheKey)
  if (cached) return cached

  const data = await fetchDashboardReport(startDate, endDate)
  setToCache(cacheKey, data, CACHE_TTL)
  return data
}

async function fetchDashboardReport(startDate: string, endDate: string) {
  try {
    const [overview, dailyData, topPages, events, trafficSources, mfoClicks] = await Promise.all([
      getOverviewStats(startDate, endDate),
      getDailyData(startDate, endDate),
      getTopPages(startDate, endDate, 10),
      getEvents(startDate, endDate, 20),
      getTrafficSources(startDate, endDate, 10),
      getMfoClicksByPage(startDate, endDate, 10),
    ])

    // Находим событие click_mfo_button
    const mfoClickEvent = events.find((e) => e.eventName === 'click_mfo_button')

    return {
      overview,
      dailyData,
      topPages,
      events,
      trafficSources,
      devices: [], // Можно добавить отдельно
      mfoClicks: {
        totalClicks: mfoClickEvent?.eventCount || 0,
        clicksByOffer: [], // Требует кастомного параметра в событии
        clicksByPage: mfoClicks,
      },
      period: {
        startDate,
        endDate,
      },
      lastUpdated: new Date().toISOString(),
      hasData: overview.users > 0 || overview.events > 0,
    }
  } catch (error) {
    console.error('[GA4 Error] getDashboardReport:', error)
    throw error instanceof GA4ApiError
      ? error
      : new GA4ApiError('Ошибка получения отчёта', 500)
  }
}

// ============================================
// Export
// ============================================

export const ga4Client = {
  getOverviewStats,
  getDailyData,
  getTopPages,
  getEvents,
  getEventByName,
  getMfoClicksByPage,
  getTrafficSources,
  getDashboardReport,
  clearCache: () => cache.clear(),
  getConfig,
}
