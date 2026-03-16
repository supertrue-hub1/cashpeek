import { NextRequest, NextResponse } from 'next/server';
import {
  generateSitemapXml,
  getStaticUrls,
  getCategoryUrls,
  getCityUrls,
  getCategoryCityUrls,
  getMfoUrls,
  getBlogUrls,
  getSeoPageUrls,
  getSeoCombinationUrls,
  URLS_PER_SITEMAP,
} from '@/lib/seo/sitemap-utils';

// Маппинг ID к функциям получения URL
const URL_GETTERS: Record<string, () => Promise<any[]> | any[]> = {
  static: getStaticUrls,
  categories: getCategoryUrls,
  cities: getCityUrls,
  'category-city': getCategoryCityUrls,
  mfo: getMfoUrls,
  blog: getBlogUrls,
  'seo-pages': getSeoPageUrls,
  'seo-combinations': getSeoCombinationUrls,
};

// Кэширование на 1 час
export const revalidate = 3600;

/**
 * Динамические части sitemap
 * GET /sitemap-[id].xml
 * GET /sitemap-[id]-[chunk].xml
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id?: string }> }
) {
  try {
    const params = await context.params;
    const id = params?.id;
    
    if (!id) {
      return new NextResponse('Missing sitemap ID', { status: 400 });
    }
    
    // Парсим ID: "mfo" или "mfo-2"
    const match = id.match(/^([a-z-]+)(?:-(\d+))?$/);
    
    if (!match) {
      return new NextResponse('Invalid sitemap ID', { status: 400 });
    }

    const [, sitemapId, chunkStr] = match;
    const chunk = chunkStr ? parseInt(chunkStr, 10) : 1;

    const getUrls = URL_GETTERS[sitemapId];
    
    if (!getUrls) {
      return new NextResponse('Sitemap not found', { status: 404 });
    }

    // Получаем URL
    const allUrls = typeof getUrls === 'function' 
      ? await (getUrls as () => Promise<any[]>)() 
      : getUrls;

    if (!allUrls || allUrls.length === 0) {
      return new NextResponse('No URLs in sitemap', { status: 404 });
    }

    // Разбиваем на чанки
    const startIndex = (chunk - 1) * URLS_PER_SITEMAP;
    const endIndex = startIndex + URLS_PER_SITEMAP;
    const urls = allUrls.slice(startIndex, endIndex);

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
  } catch (error) {
    console.error('[Sitemap Part] Error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
