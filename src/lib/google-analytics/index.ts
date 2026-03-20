/**
 * Google Analytics 4 - публичный API
 */

// Client
export { ga4Client } from './client'

// Queries
export {
  getOverviewStats,
  getDailyData,
  getTopPages,
  getEvents,
  getEventByName,
  getMfoClicksByPage,
  getTrafficSources,
  getDashboardReport,
} from './client'

// Types
export type {
  GA4Config,
  GA4Credentials,
  DailyData,
  TopPage,
  GA4Event,
  EventConversion,
  TrafficSource,
  DeviceData,
  GA4DashboardReport,
} from './types'

export { GA4ApiError, GA4_METRICS, GA4_DIMENSIONS, MFO_EVENTS } from './types'
