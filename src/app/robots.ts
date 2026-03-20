import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Robots.txt
 * 
 * Настройки индексации для поисковых систем
 * Включает все лучшие практики SEO
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Основные правила для всех ботов
        userAgent: '*',
        allow: '/',
        disallow: [
          // Служебные разделы
          '/api/',
          '/admin/',
          '/cabinet/',
          '/_next/',
          // Авторизация
          '/login',
          '/register',
          '/reset-password',
          // Приватные страницы
          '/private/',
          // Параметры URL (дубли контента)
          '/*?utm_',
          '/*?ref=',
          '/*?source=',
          '/*?utm_source',
          '/*?utm_medium',
          '/*?utm_campaign',
          // Файлы
          '*.json',
          '*.xml',
          // Дубли страниц
          '/404',
          '/500',
        ],
      },
      {
        // Googlebot - более мягкие правила
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/cabinet/',
          '/_next/',
        ],
      },
      {
        // Yandexbot - специальные правила для Яндекса
        userAgent: 'Yandex',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/cabinet/',
          '/_next/',
          '/login',
          '/register',
        ],
        // Яндекс-specific директивы (будут добавлены как комментарий)
      },
      {
        // YandexImages
        userAgent: 'YandexImages',
        allow: '/',
        disallow: ['/api/', '/admin/', '/cabinet/'],
      },
      {
        // Googlebot-Image
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/api/', '/admin/', '/cabinet/'],
      },
      {
        // Googlebot-News (если есть новости)
        userAgent: 'Googlebot-News',
        allow: '/blog/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    // Sitemap файлы
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-static.xml`,
      `${BASE_URL}/sitemap-categories.xml`,
      `${BASE_URL}/sitemap-cities.xml`,
      `${BASE_URL}/sitemap-hub.xml`,
      `${BASE_URL}/sitemap-mfo.xml`,
      `${BASE_URL}/sitemap-blog.xml`,
    ],
    // Основное зеркало для Яндекса
    host: BASE_URL,
  };
}
