import { MetadataRoute } from 'next';
import { LOAN_CATEGORIES, CITIES } from '@/lib/seo/slugs';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Sitemap для hub-страниц (категория + город)
 * Генерирует URL вида: /zaimy/na-kartu/v-moskva
 */
export default function sitemapHub(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];
  
  // Категория + Город
  Object.keys(LOAN_CATEGORIES).forEach((catSlug) => {
    Object.keys(CITIES).forEach((citySlug) => {
      urls.push({
        url: `${BASE_URL}/zaimy/${catSlug}/v-${citySlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });
  
  return urls;
}
