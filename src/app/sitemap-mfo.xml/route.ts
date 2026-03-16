import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Sitemap для страниц МФО
 * Динамически генерируется из базы данных
 */
export default async function sitemapMfo(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  
  try {
    // Получаем все опубликованные МФО
    const mfos = await db.loanOffer.findMany({
      where: { status: 'published' },
      select: { 
        slug: true, 
        updatedAt: true,
        rating: true,
      },
      orderBy: { rating: 'desc' },
    });
    
    const urls: MetadataRoute.Sitemap = [];
    
    // Главная страница МФО
    mfos.forEach((mfo) => {
      urls.push({
        url: `${BASE_URL}/mfo/${mfo.slug}`,
        lastModified: mfo.updatedAt || now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      
      // Страница отзывов
      urls.push({
        url: `${BASE_URL}/mfo/${mfo.slug}/otzyvy`,
        lastModified: mfo.updatedAt || now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
      
      // Страница заявки
      urls.push({
        url: `${BASE_URL}/mfo/${mfo.slug}/zayavka`,
        lastModified: mfo.updatedAt || now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    });
    
    return urls;
  } catch (error) {
    console.error('[Sitemap MFO] Error:', error);
    return [];
  }
}
