import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  getStaticUrls,
  getCategoryUrls,
  getCityUrls,
  getCategoryCityUrls,
  URLS_PER_SITEMAP,
  BASE_URL,
} from '@/lib/seo/sitemap-utils';

// Определяем типы sitemap-частей
const STATIC_PARTS = [
  { id: 'static', name: 'Статические страницы' },
  { id: 'categories', name: 'Категории' },
  { id: 'cities', name: 'Города' },
  { id: 'category-city', name: 'Категории+Города' },
];

const ASYNC_PARTS = [
  { id: 'mfo', name: 'МФО', model: 'loanOffer' },
  { id: 'blog', name: 'Блог', model: 'blogPost' },
  { id: 'seo-pages', name: 'SEO-страницы', model: 'seoPage' },
  { id: 'seo-combinations', name: 'SEO-комбинации', model: 'seoCombination' },
];

// Кэширование sitemap index на 1 час
export const revalidate = 3600;

/**
 * Sitemap Index — главный файл, указывающий на все части
 * GET /sitemap.xml
 */
export async function GET() {
  try {
    const now = new Date().toISOString().split('T')[0];
    const sitemaps: { loc: string; lastmod?: string }[] = [];

    // Добавляем статические части
    for (const part of STATIC_PARTS) {
      sitemaps.push({
        loc: `${BASE_URL}/sitemaps/${part.id}`,
        lastmod: now,
      });
    }

    // Подсчитываем записи для асинхронных частей
    const counts = await Promise.all([
      db.loanOffer.count({ where: { status: 'published' } }),
      db.blogPost.count({ where: { status: 'published' } }),
      db.seoPage.count({ where: { isIndexable: true, noIndex: false, status: 'published' } }),
      db.seoCombination.count({ where: { isIndexable: true, noIndex: false, status: 'published' } }),
    ]);

    // Добавляем асинхронные части с чанками
    for (let i = 0; i < ASYNC_PARTS.length; i++) {
      const part = ASYNC_PARTS[i];
      const count = counts[i];
      const chunks = Math.ceil(count / URLS_PER_SITEMAP) || 1;

      for (let j = 0; j < chunks; j++) {
        sitemaps.push({
          loc: `${BASE_URL}/sitemaps/${part.id}${chunks > 1 ? `-${j + 1}` : ''}`,
          lastmod: now,
        });
      }
    }

    // Генерируем XML для sitemap index
    const sitemapElements = sitemaps
      .map((s) => {
        let element = `  <sitemap>\n    <loc>${s.loc}</loc>`;
        if (s.lastmod) {
          element += `\n    <lastmod>${s.lastmod}</lastmod>`;
        }
        element += '\n  </sitemap>';
        return element;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[Sitemap Index] Error:', error);
    return new NextResponse('Error generating sitemap index', { status: 500 });
  }
}
