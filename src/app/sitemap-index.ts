import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Sitemap Index — указывает на все подтематические sitemap'ы
 * 
 * Структура:
 * - sitemap-static.xml — статические страницы
 * - sitemap-categories.xml — категории займов
 * - sitemap-cities.xml — города
 * - sitemap-hub.xml — категории + города (новые hub-страницы)
 * - sitemap-mfo.xml — страницы МФО
 * - sitemap-blog.xml — блог
 */
export default function sitemapIndex(): MetadataRoute.SitemapIndex {
  const now = new Date().toISOString();
  
  return [
    {
      url: `${BASE_URL}/sitemap-static.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap-categories.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap-cities.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap-hub.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap-mfo.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap-blog.xml`,
      lastModified: now,
    },
  ];
}
