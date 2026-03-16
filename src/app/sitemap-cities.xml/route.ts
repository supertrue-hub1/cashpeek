import { MetadataRoute } from 'next';
import { CITIES } from '@/lib/seo/slugs';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Sitemap для городов
 */
export default function sitemapCities(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];
  
  // Города
  Object.entries(CITIES).forEach(([slug]) => {
    urls.push({
      url: `${BASE_URL}/zaimy/v-${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });
  
  return urls;
}
