/**
 * Яндекс.Метрика API Client
 * С кэшированием и обработкой ошибок
 */

import { unstable_cache } from 'next/cache'
import {
  MetricaConfig,
  MetricaQueryParams,
  MetricaResponse,
  MetricaApiError,
  CacheEntry,
} from './types'

// ============================================
// Configuration
// ============================================

const DEFAULT_BASE_URL = 'https://api-metrika.yandex.ru/stat/v1'

const config: MetricaConfig = {
  token: process.env.METRICA_TOKEN || '',
  counterId: process.env.NEXT_PUBLIC_YM_ID || '',
  baseUrl: DEFAULT_BASE_URL,
}

// ============================================
// In-memory Cache (для одного запроса)
// ============================================

const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Получить данные из кэша
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Сохранить данные в кэш
 */
function setToCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  })
}

// ============================================
// API Client
// ============================================

/**
 * Базовый запрос к API Яндекс.Метрики
 */
async function fetchMetricaApi<T>(
  params: Partial<MetricaQueryParams>,
  options: {
    revalidate?: number // Next.js revalidate в секундах
    cacheTtl?: number // Кэш в памяти в миллисекундах
  } = {}
): Promise<MetricaResponse<T>> {
  const { revalidate = 900, cacheTtl = 15 * 60 * 1000 } = options // 15 минут по умолчанию

  // Проверка конфигурации
  if (!config.token) {
    throw new MetricaApiError('METRICA_TOKEN не настроен', 401)
  }
  if (!config.counterId) {
    throw new MetricaApiError('NEXT_PUBLIC_YM_ID не настроен', 401)
  }

  // Формируем URL
  const url = new URL(`${config.baseUrl}/data`)

  // Обязательные параметры
  url.searchParams.set('ids', config.counterId)
  url.searchParams.set('metrics', params.metrics || '')
  url.searchParams.set('date1', params.date1 || '7daysAgo')
  url.searchParams.set('date2', params.date2 || 'today')

  // Опциональные параметры
  if (params.dimensions) {
    url.searchParams.set('dimensions', params.dimensions)
  }
  if (params.sort) {
    url.searchParams.set('sort', params.sort)
  }
  if (params.limit) {
    url.searchParams.set('limit', params.limit.toString())
  }
  if (params.offset) {
    url.searchParams.set('offset', params.offset.toString())
  }
  if (params.filters) {
    url.searchParams.set('filters', params.filters)
  }
  if (params.accuracy) {
    url.searchParams.set('accuracy', params.accuracy)
  }
  if (params.group) {
    url.searchParams.set('group', params.group)
  }

  const cacheKey = url.toString()

  // Проверяем in-memory кэш
  const cachedData = getFromCache<MetricaResponse<T>>(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${config.token}`,
        'Content-Type': 'application/json',
      },
      next: {
        revalidate, // Next.js cache
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new MetricaApiError(
        errorData.message || `API Error: ${response.status}`,
        response.status,
        errorData
      )
    }

    const data: MetricaResponse<T> = await response.json()

    // Сохраняем в кэш
    setToCache(cacheKey, data, cacheTtl)

    return data
  } catch (error) {
    if (error instanceof MetricaApiError) {
      throw error
    }
    throw new MetricaApiError(
      `Ошибка запроса к Яндекс.Метрике: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

// ============================================
// Cached Query Functions
// ============================================

/**
 * Создать кэшированный запрос
 * Использует unstable_cache Next.js для ISR
 */
export function createCachedQuery<T>(
  queryKey: string,
  fetcher: () => Promise<T>,
  revalidate: number = 900 // 15 минут
): () => Promise<T> {
  return unstable_cache(fetcher, [`metrica-${queryKey}`], {
    revalidate,
    tags: ['metrica', queryKey],
  })
}

// ============================================
// Export Client
// ============================================

export const metricaClient = {
  /**
   * Выполнить запрос к API
   */
  query: fetchMetricaApi,

  /**
   * Получить конфигурацию
   */
  getConfig: () => ({ ...config }),

  /**
   * Проверить доступность API
   */
  async ping(): Promise<boolean> {
    try {
      await fetchMetricaApi(
        {
          metrics: 'ym:s:visits',
          date1: 'today',
          date2: 'today',
          limit: 1,
        },
        { revalidate: 60, cacheTtl: 60000 }
      )
      return true
    } catch {
      return false
    }
  },

  /**
   * Очистить кэш
   */
  clearCache: () => cache.clear(),
}

export type { MetricaConfig, MetricaQueryParams, MetricaResponse }
