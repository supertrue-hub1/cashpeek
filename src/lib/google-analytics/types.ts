/**
 * Типы для Google Analytics 4 API
 */

// ============================================
// Configuration
// ============================================

export interface GA4Config {
  propertyId: string // GA4 Property ID (например, "123456789")
  credentials: GA4Credentials | string // JSON или путь к файлу
}

export interface GA4Credentials {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
  universe_domain: string
}

// ============================================
// Report Types
// ============================================

/** Данные за день */
export interface DailyData {
  date: string // YYYY-MM-DD
  users: number
  sessions: number
  pageviews: number
  events: number
}

/** Топ страница */
export interface TopPage {
  path: string
  title?: string
  pageviews: number
  users: number
  avgTimeOnPage: number
  bounceRate: number
  share: number
}

/** Событие */
export interface GA4Event {
  eventName: string
  eventCount: number
  eventUsers: number
  avgEventValue: number
  share: number
}

/** Конверсия по событию */
export interface EventConversion {
  eventName: string
  totalUsers: number
  eventUsers: number
  conversionRate: number
  trend?: number
}

/** Источник трафика */
export interface TrafficSource {
  source: string
  medium: string
  sourceMedium: string
  users: number
  sessions: number
  newUsers: number
  share: number
}

/** Данные устройства */
export interface DeviceData {
  device: string
  browser?: string
  users: number
  sessions: number
  share: number
}

/** Полный отчёт для дашборда */
export interface GA4DashboardReport {
  overview: {
    users: number
    newUsers: number
    sessions: number
    pageviews: number
    avgSessionDuration: number
    bounceRate: number
    events: number
  }
  dailyData: DailyData[]
  topPages: TopPage[]
  events: GA4Event[]
  trafficSources: TrafficSource[]
  devices: DeviceData[]
  mfoClicks: {
    totalClicks: number
    clicksByOffer: Array<{
      offerName: string
      clicks: number
    }>
    clicksByPage: Array<{
      page: string
      clicks: number
    }>
  }
  period: {
    startDate: string
    endDate: string
  }
  lastUpdated: string
  hasData: boolean
}

// ============================================
// API Response Types
// ============================================

export interface GA4ReportRow {
  dimensionValues: Array<{ value: string }>
  metricValues: Array<{ value: string }>
}

export interface GA4ReportResponse {
  rows?: GA4ReportRow[]
  totals?: Array<{ metricValues: Array<{ value: string }> }>
  rowCount?: number
  metadata?: {
    dataLossFromOtherRow: boolean
  }
}

// ============================================
// Error Types
// ============================================

export class GA4ApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'GA4ApiError'
  }
}

// ============================================
// Cache Types
// ============================================

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// ============================================
// Constants
// ============================================

/** Основные метрики GA4 */
export const GA4_METRICS = {
  users: 'totalUsers', // Изменили с 'users' на 'totalUsers'
  newUsers: 'newUsers',
  sessions: 'sessions',
  pageviews: 'screenPageViews',
  events: 'eventCount',
  eventValue: 'eventValue',
  sessionDuration: 'averageSessionDuration',
  bounceRate: 'bounceRate',
  engagements: 'engagedSessions',
  activeUsers: 'activeUsers',
} as const

/** Измерения GA4 */
export const GA4_DIMENSIONS = {
  date: 'date',
  pagePath: 'pagePath',
  pageTitle: 'pageTitle',
  eventName: 'eventName',
  source: 'sessionSource',
  medium: 'sessionMedium',
  sourceMedium: 'sessionSourceMedium',
  device: 'deviceCategory',
  browser: 'browser',
  country: 'country',
  city: 'city',
  hostname: 'hostName',
} as const

/** Важные события для агрегатора */
export const MFO_EVENTS = {
  clickMfoButton: 'click_mfo_button',
  viewOffer: 'view_offer',
  submitForm: 'submit_form',
  filterByAmount: 'filter_by_amount',
  filterByTerm: 'filter_by_term',
} as const
