/**
 * Типы для Яндекс.Метрики API v3
 * Документация: https://yandex.ru/dev/metrika/doc/api/createdirect/stat-v3.html
 */

// ============================================
// Base Types
// ============================================

export interface MetricaConfig {
  token: string
  counterId: string
  baseUrl?: string
}

// ============================================
// API Request Types
// ============================================

export interface MetricaQueryParams {
  /** ID счетчика */
  ids: string
  /** Метрики (через запятую) */
  metrics: string
  /** Измерения (через запятую) */
  dimensions?: string
  /** Дата начала (YYYY-MM-DD или relative: today, yesterday, NdaysAgo) */
  date1: string
  /** Дата окончания */
  date2: string
  /** Сортировка */
  sort?: string
  /** Лимит записей */
  limit?: number
  /** Смещение */
  offset?: number
  /** Фильтры */
  filters?: string
  /** Точность (1 = 100%, 0.1 = 10% sample) */
  accuracy?: 'full' | '1' | '0.1' | '0.01'
  /** Группировка по времени */
  group?: 'day' | 'week' | 'month' | 'year' | 'all'
}

// ============================================
// API Response Types
// ============================================

export interface MetricaResponse<T = unknown> {
  /** Запрос */
  query: {
    ids: number
    metrics: string[]
    dimensions: string[]
    sort: string[]
    date1: string
    date2: string
    limit: number
    offset: number
    group: string
    accuracy: string
  }
  /** Данные */
  data: MetricaDataItem[]
  /** Общие totals */
  totals: number[]
  /** Мин. значения */
  min: number[]
  /** Макс. значения */
  max: number[]
  /** Время генерации */
  sample_info?: {
    sample_size: number
    sample_space: number
    sample_share: number
  }
}

export interface MetricaDataItem {
  /** Измерения */
  dimensions: Array<{
    id: string
    name: string
  }>
  /** Метрики */
  metrics: number[]
}

// ============================================
// Business Types (для UI компонентов)
// ============================================

/** Общая статистика визитов */
export interface VisitsStats {
  visits: number
  pageviews: number
  visitors: number
  newVisitors: number
  bounceRate: number
  pageDepth: number
  avgVisitDurationSeconds: number
}

/** Статистика за период */
export interface PeriodStats extends VisitsStats {
  period: {
    date1: string
    date2: string
  }
  change?: {
    visits: number // Процент изменения
    pageviews: number
    visitors: number
  }
}

/** Топ страница */
export interface TopPage {
  url: string
  title?: string
  views: number
  visits: number
  avgTime: number
  bounceRate: number
  share: number // Процент от общего количества
}

/** Источник трафика */
export interface TrafficSource {
  source: string
  name: string
  visits: number
  pageviews: number
  visitors: number
  bounceRate: number
  share: number
}

/** Данные по дням */
export interface DailyStats {
  date: string
  visits: number
  pageviews: number
  visitors: number
}

/** Goal конверсия */
export interface GoalConversion {
  goalId: string
  goalName: string
  reaches: number // Количество достижений цели
  conversions: number // Процент конверсии
  visits: number // Визитов с целью
}

/** Данные для графиков */
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

/** Полный отчёт для дашборда */
export interface MetricaDashboardReport {
  visits: PeriodStats
  topPages: TopPage[]
  trafficSources: TrafficSource[]
  dailyStats: DailyStats[]
  goalConversions: GoalConversion[]
  lastUpdated: string
  hasData: boolean
}

// ============================================
// Error Types
// ============================================

export interface MetricaError {
  code: number
  message: string
  errors?: Array<{
    error_type: string
    message: string
    location?: string
  }>
}

export class MetricaApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public details?: MetricaError
  ) {
    super(message)
    this.name = 'MetricaApiError'
  }
}

// ============================================
// Cache Types
// ============================================

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

// ============================================
// Constants
// ============================================

/** Метрики визитов */
export const VISIT_METRICS = {
  visits: 'ym:s:visits',
  pageviews: 'ym:s:pageviews',
  users: 'ym:s:users',
  newUsers: 'ym:s:newUsers',
  bounceRate: 'ym:s:bounceRate',
  pageDepth: 'ym:s:pageDepth',
  avgVisitDurationSeconds: 'ym:s:avgVisitDurationSeconds',
} as const

/** Измерения для источников трафика */
export const TRAFFIC_DIMENSIONS = {
  source: 'ym:s:trafficSource',
  sourceEngine: 'ym:s:<attribution>TrafficSource',
  socialNetwork: 'ym:s:socialNetwork',
  searchEngine: 'ym:s:searchEngine',
} as const

/** Измерения для страниц */
export const PAGE_DIMENSIONS = {
  url: 'ym:pv:URL',
  urlPath: 'ym:pv:URLPath',
  title: 'ym:pv:title',
} as const

/** Группировка по времени */
export const TIME_GROUPS = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
  all: 'all',
} as const
