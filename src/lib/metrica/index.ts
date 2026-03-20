/**
 * Яндекс.Метрика - публичный API
 */

// Client
export { metricaClient, createCachedQuery } from './client'
export type { MetricaConfig, MetricaQueryParams, MetricaResponse } from './client'

// Queries
export { metricaQueries } from './queries'
export {
  getVisitsStats,
  getTopPages,
  getTrafficSources,
  getDailyStats,
  getGoalConversions,
  getPageDepth,
  getDashboardReport,
} from './queries'

// Types
export type {
  VisitsStats,
  PeriodStats,
  TopPage,
  TrafficSource,
  DailyStats,
  GoalConversion,
  MetricaDashboardReport,
  ChartDataPoint,
  MetricaError,
} from './types'

export { MetricaApiError } from './types'
export { VISIT_METRICS, TRAFFIC_DIMENSIONS, PAGE_DIMENSIONS, TIME_GROUPS } from './types'
