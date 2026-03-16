import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Robots.txt
 * 
 * Настройки индексации для поисковых систем
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/cabinet/',
          '/login',
          '/register',
          '/_next/',
          '/private/',
          '/*?utm_',
          '/*?ref=',
          '/*?source=',
          '/*?page=',
          '*.json',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/cabinet/',
        ],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/sitemap-static.xml`,
      `${BASE_URL}/sitemap-categories.xml`,
      `${BASE_URL}/sitemap-cities.xml`,
      `${BASE_URL}/sitemap-hub.xml`,
      `${BASE_URL}/sitemap-mfo.xml`,
      `${BASE_URL}/sitemap-blog.xml`,
    ],
    host: BASE_URL,
  };
}
