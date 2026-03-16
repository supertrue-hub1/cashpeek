/**
 * Redis Cache Client
 * 
 * Кэширование для:
 * - Офферов МФО
 * - SEO-страниц
 * - Результатов поиска
 * - Блог-статей
 */

import Redis from 'ioredis';

// ============================================
// Redis Configuration
// ============================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_PREFIX = 'cashpeek:';
const DEFAULT_TTL = 3600; // 1 час

// ============================================
// Redis Client
// ============================================

let redis: Redis | null = null;

/**
 * Получение Redis клиента (Singleton)
 */
export function getRedisClient(): Redis | null {
  if (redis) {
    return redis;
  }
  
  // Проверяем, включён ли Redis
  if (process.env.REDIS_ENABLED !== 'true') {
    console.log('[Redis] Disabled by REDIS_ENABLED env');
    return null;
  }
  
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 3000,
    });
    
    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
    
    redis.on('error', (error) => {
      console.error('[Redis] Connection error:', error.message);
      redis = null;
    });
    
    redis.on('close', () => {
      console.log('[Redis] Connection closed');
      redis = null;
    });
    
    return redis;
  } catch (error) {
    console.error('[Redis] Failed to create client:', error);
    return null;
  }
}

// ============================================
// Cache Functions
// ============================================

/**
 * Получение данных из кэша
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  
  if (!client) {
    return null;
  }
  
  try {
    const data = await client.get(`${CACHE_PREFIX}${key}`);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`[Redis] Error getting cache key "${key}":`, error);
    return null;
  }
}

/**
 * Сохранение данных в кэш
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  const client = getRedisClient();
  
  if (!client) {
    return false;
  }
  
  try {
    await client.setex(
      `${CACHE_PREFIX}${key}`,
      ttl,
      JSON.stringify(data)
    );
    
    return true;
  } catch (error) {
    console.error(`[Redis] Error setting cache key "${key}":`, error);
    return false;
  }
}

/**
 * Удаление данных из кэша
 */
export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  
  if (!client) {
    return false;
  }
  
  try {
    await client.del(`${CACHE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error(`[Redis] Error deleting cache key "${key}":`, error);
    return false;
  }
}

/**
 * Удаление данных по паттерну
 */
export async function deleteCachePattern(pattern: string): Promise<number> {
  const client = getRedisClient();
  
  if (!client) {
    return 0;
  }
  
  try {
    const keys = await client.keys(`${CACHE_PREFIX}${pattern}`);
    
    if (keys.length === 0) {
      return 0;
    }
    
    await client.del(...keys);
    return keys.length;
  } catch (error) {
    console.error(`[Redis] Error deleting cache pattern "${pattern}":`, error);
    return 0;
  }
}

/**
 * Получение или вычисление данных (Cache-Aside pattern)
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Пробуем получить из кэша
  const cached = await getCache<T>(key);
  
  if (cached !== null) {
    return cached;
  }
  
  // Вычисляем данные
  const data = await fetcher();
  
  // Сохраняем в кэш
  await setCache(key, data, ttl);
  
  return data;
}

// ============================================
// Cache Keys
// ============================================

export const CacheKeys = {
  // Офферы
  offers: {
    all: 'offers:all',
    byCategory: (slug: string) => `offers:category:${slug}`,
    byCity: (slug: string) => `offers:city:${slug}`,
    hub: (category: string, city: string) => `offers:hub:${category}:${city}`,
  },
  
  // SEO
  seo: {
    categories: 'seo:categories',
    cities: 'seo:cities',
    page: (path: string) => `seo:page:${path}`,
  },
  
  // Блог
  blog: {
    posts: 'blog:posts',
    post: (slug: string) => `blog:post:${slug}`,
    categories: 'blog:categories',
  },
  
  // Sitemap
  sitemap: {
    mfo: 'sitemap:mfo',
    blog: 'sitemap:blog',
  },
};

// ============================================
// Cache TTLs
// ============================================

export const CacheTTL = {
  SHORT: 300,      // 5 минут
  MEDIUM: 3600,    // 1 час
  LONG: 86400,     // 1 день
  WEEK: 604800,    // 1 неделя
};
