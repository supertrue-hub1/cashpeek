import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Sitemap для блога
 * Динамически генерируется из базы данных
 */
export default async function sitemapBlog(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];
  
  try {
    // Получаем все опубликованные статьи
    const posts = await db.blogPost.findMany({
      where: { status: 'published' },
      select: { 
        slug: true, 
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
    
    // Получаем все категории блога
    const categories = await db.blogCategory.findMany({
      select: { slug: true, updatedAt: true },
    });
    
    // Страницы статей
    posts.forEach((post) => {
      urls.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || now,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
    
    // Страницы категорий
    categories.forEach((cat) => {
      urls.push({
        url: `${BASE_URL}/blog/category/${cat.slug}`,
        lastModified: cat.updatedAt || now,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });
    
    return urls;
  } catch (error) {
    console.error('[Sitemap Blog] Error:', error);
    return [];
  }
}
