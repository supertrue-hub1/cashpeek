import { NextRequest, NextResponse } from 'next/server';
import {
  generateSitemapXml,
  getStaticUrls,
  getCategoryUrls,
  getCityUrls,
  getCategoryCityUrls,
  URLS_PER_SITEMAP,
  BASE_URL,
} from '@/lib/seo/sitemap-utils';
import { db } from '@/lib/db';

// Маппинг ID к функциям получения URL (для синхронных и небольших данных)
const URL_GETTERS: Record<string, () => any[]> = {
  static: getStaticUrls,
  categories: getCategoryUrls,
  cities: getCityUrls,
  'category-city': getCategoryCityUrls,
};

// Асинхронные функции с пагинацией
const ASYNC_GETTERS: Record<string, (skip: number, take: number) => Promise<any[]>> = {
  mfo: async (skip, take) => {
    const data = await db.loanOffer.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { rating: 'desc' },
      skip,
      take,
    });
    return data.map((mfo) => ({
      loc: `${BASE_URL}/mfo/${mfo.slug}`,
      lastmod: mfo.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.8,
    }));
  },
  blog: async (skip, take) => {
    const [posts, categories] = await Promise.all([
      db.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take,
      }),
      db.blogCategory.findMany({ select: { slug: true } }),
    ]);

    const postUrls = posts.map((post) => ({
      loc: `${BASE_URL}/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly' as const,
      priority: 0.6,
    }));

    const categoryUrls = categories.map((cat) => ({
      loc: `${BASE_URL}/blog/${cat.slug}`,
      changefreq: 'weekly' as const,
      priority: 0.5,
    }));

    return [...postUrls, ...categoryUrls];
  },
  'seo-pages': async (skip, take) => {
    const pages = await db.seoPage.findMany({
      where: { isIndexable: true, noIndex: false, status: 'published' },
      select: { urlPath: true, updatedAt: true, priority: true },
      orderBy: { priority: 'desc' },
      skip,
      take,
    });
    return pages.map((page) => ({
      loc: `${BASE_URL}${page.urlPath}`,
      lastmod: page.updatedAt?.toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: (page.priority || 5) / 10,
    }));
  },
  'seo-combinations': async (skip, take) => {
    // Убираем orderBy для скорости - используем индекс
    const pages = await db.seoCombination.findMany({
      where: { isIndexable: true, noIndex: false, status: 'published' },
      select: { urlPath: true, updatedAt: true },
      skip,
      take,
    });
    return pages.map((page) => ({
      loc: `${BASE_URL}${page.urlPath}`,
      lastmod: page.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.5,
    }));
  },
};

// Кэширование на 1 час
export const revalidate = 3600;

/**
 * Динамические части sitemap
 * GET /sitemaps/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Парсим ID: "mfo" или "seo-combinations-1"
    // Ищем числовой суффикс в конце строки
    const numericMatch = id.match(/^(.+)-(\d+)$/);
    
    let sitemapId: string;
    let chunk: number;
    
    if (numericMatch) {
      sitemapId = numericMatch[1];
      chunk = parseInt(numericMatch[2], 10);
    } else {
      sitemapId = id;
      chunk = 1;
    }

    console.log(`[Sitemap] Request: id=${id}, sitemapId=${sitemapId}, chunk=${chunk}`);

    // Проверяем синхронные геттеры
    const syncGetter = URL_GETTERS[sitemapId];
    if (syncGetter) {
      const urls = syncGetter();
      const xml = generateSitemapXml(urls);
      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    // Проверяем асинхронные геттеры с пагинацией
    const asyncGetter = ASYNC_GETTERS[sitemapId];
    if (asyncGetter) {
      const skip = (chunk - 1) * URLS_PER_SITEMAP;
      console.log(`[Sitemap] Fetching: skip=${skip}, take=${URLS_PER_SITEMAP}`);
      
      const urls = await asyncGetter(skip, URLS_PER_SITEMAP);
      console.log(`[Sitemap] Got ${urls.length} URLs`);
      
      if (urls.length === 0) {
        return new NextResponse('Sitemap chunk not found', { status: 404 });
      }

      const xml = generateSitemapXml(urls);
      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    }

    console.error(`[Sitemap] Unknown sitemap ID: ${sitemapId}`);
    return new NextResponse('Sitemap not found', { status: 404 });
  } catch (error) {
    console.error('[Sitemap Part] Error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
