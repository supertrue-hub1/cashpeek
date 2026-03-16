import { db } from '@/lib/db';
import { LOAN_CATEGORIES, CITIES } from '@/lib/seo/slugs';

const BASE_URL = 'https://cashpeek.ru';
const URLS_PER_SITEMAP = 10000; // Уменьшено для производительности

// Типы для sitemap
type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

// Генерация XML для sitemap
function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map((url) => {
      let element = `  <url>\n    <loc>${url.loc}</loc>`;
      if (url.lastmod) {
        element += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      if (url.changefreq) {
        element += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      if (url.priority !== undefined) {
        element += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }
      element += '\n  </url>';
      return element;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

// Генерация XML для sitemap index
function generateSitemapIndexXml(sitemaps: { loc: string; lastmod?: string }[]): string {
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

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

// Получение URL для статических страниц
function getStaticUrls(): SitemapUrl[] {
  const now = new Date().toISOString().split('T')[0];
  
  return [
    { loc: BASE_URL, lastmod: now, changefreq: 'daily', priority: 1.0 },
    { loc: `${BASE_URL}/zaimy`, lastmod: now, changefreq: 'daily', priority: 0.95 },
    { loc: `${BASE_URL}/sravnit`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${BASE_URL}/mfo`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { loc: `${BASE_URL}/blog`, lastmod: now, changefreq: 'daily', priority: 0.8 },
  ];
}

// Получение URL для категорий
function getCategoryUrls(): SitemapUrl[] {
  const now = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];

  Object.keys(LOAN_CATEGORIES).forEach((slug) => {
    urls.push({
      loc: `${BASE_URL}/zaimy/${slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.85,
    });
  });

  return urls;
}

// Получение URL для городов
function getCityUrls(): SitemapUrl[] {
  const now = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];

  Object.keys(CITIES).forEach((slug) => {
    urls.push({
      loc: `${BASE_URL}/zaimy/v-${slug}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8,
    });
  });

  return urls;
}

// Получение URL для категорий + города
function getCategoryCityUrls(): SitemapUrl[] {
  const now = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];

  Object.keys(LOAN_CATEGORIES).forEach((catSlug) => {
    Object.keys(CITIES).forEach((citySlug) => {
      urls.push({
        loc: `${BASE_URL}/zaimy/${catSlug}/v-${citySlug}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7,
      });
    });
  });

  return urls;
}

// Получение URL для МФО из базы
async function getMfoUrls(): Promise<SitemapUrl[]> {
  try {
    const mfos = await db.loanOffer.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { rating: 'desc' },
    });

    return mfos.map((mfo) => ({
      loc: `${BASE_URL}/mfo/${mfo.slug}`,
      lastmod: mfo.updatedAt.toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[Sitemap] Error fetching MFO:', error);
    return [];
  }
}

// Получение URL для блога
async function getBlogUrls(): Promise<SitemapUrl[]> {
  try {
    const posts = await db.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    const categories = await db.blogCategory.findMany({
      select: { slug: true },
    });

    const postUrls: SitemapUrl[] = posts.map((post) => ({
      loc: `${BASE_URL}/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString().split('T')[0],
      changefreq: 'monthly' as const,
      priority: 0.6,
    }));

    const categoryUrls: SitemapUrl[] = categories.map((cat) => ({
      loc: `${BASE_URL}/blog/${cat.slug}`,
      changefreq: 'weekly' as const,
      priority: 0.5,
    }));

    return [...postUrls, ...categoryUrls];
  } catch (error) {
    console.error('[Sitemap] Error fetching blog:', error);
    return [];
  }
}

// Получение SEO-страниц из базы (старая модель)
async function getSeoPageUrls(): Promise<SitemapUrl[]> {
  try {
    const pages = await db.seoPage.findMany({
      where: {
        isIndexable: true,
        noIndex: false,
        status: 'published',
      },
      select: { urlPath: true, updatedAt: true, priority: true },
      orderBy: { priority: 'desc' },
    });

    return pages.map((page) => ({
      loc: `${BASE_URL}${page.urlPath}`,
      lastmod: page.updatedAt?.toISOString().split('T')[0],
      changefreq: 'weekly' as const,
      priority: (page.priority || 5) / 10,
    }));
  } catch (error) {
    console.error('[Sitemap] Error fetching SEO pages:', error);
    return [];
  }
}

// Получение SEO-комбинаций из базы (новая модель для 500K+ страниц)
async function getSeoCombinationUrls(): Promise<SitemapUrl[]> {
  try {
    // Используем пагинацию для больших объёмов
    const BATCH_SIZE = 10000;
    let skip = 0;
    const allUrls: SitemapUrl[] = [];
    
    while (true) {
      const batch = await db.seoCombination.findMany({
        where: {
          isIndexable: true,
          noIndex: false,
          status: 'published',
        },
        select: { 
          urlPath: true, 
          updatedAt: true, 
          priority: true 
        },
        orderBy: { priority: 'desc' },
        skip,
        take: BATCH_SIZE,
      });

      if (batch.length === 0) break;

      allUrls.push(...batch.map((page) => ({
        loc: `${BASE_URL}${page.urlPath}`,
        lastmod: page.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly' as const,
        priority: Math.min(1, Math.max(0.1, (page.priority || 5) / 10)),
      })));

      skip += BATCH_SIZE;
      
      // Логирование прогресса каждые 100K
      if (skip % 100000 === 0) {
        console.log(`[Sitemap] Loaded ${allUrls.length} SEO combinations...`);
      }
    }

    console.log(`[Sitemap] Total SEO combinations loaded: ${allUrls.length}`);
    return allUrls;
  } catch (error) {
    console.error('[Sitemap] Error fetching SEO combinations:', error);
    return [];
  }
}

// Экспорт типов для использования в других файлах
export type { SitemapUrl };
export {
  BASE_URL,
  URLS_PER_SITEMAP,
  generateSitemapXml,
  generateSitemapIndexXml,
  getStaticUrls,
  getCategoryUrls,
  getCityUrls,
  getCategoryCityUrls,
  getMfoUrls,
  getBlogUrls,
  getSeoPageUrls,
  getSeoCombinationUrls,
};
