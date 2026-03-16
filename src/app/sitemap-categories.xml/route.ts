import { MetadataRoute } from 'next';
import { LOAN_CATEGORIES } from '@/lib/seo/slugs';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Sitemap для категорий займов
 */
export default function sitemapCategories(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];
  
  // Категории
  Object.entries(LOAN_CATEGORIES).forEach(([slug]) => {
    urls.push({
      url: `${BASE_URL}/zaimy/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  });
  
  return urls;
}
