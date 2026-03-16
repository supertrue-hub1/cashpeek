import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
const SITE_NAME = 'CashPeek';
const SITE_DESCRIPTION = 'Сравнение займов и микрофинансовых организаций';

/**
 * RSS Feed для блога
 * 
 * URL: /blog/feed.xml
 */
export async function GET() {
  try {
    // Получаем последние 50 статей
    const posts = await db.blogPost.findMany({
      where: { status: 'published' },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        updatedAt: true,
        author: {
          select: { name: true },
        },
        category: {
          select: { name: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    
    // Формируем RSS XML
    const rssItems = posts
      .map((post) => {
        const pubDate = post.publishedAt 
          ? new Date(post.publishedAt).toUTCString() 
          : new Date().toUTCString();
        
        const description = post.excerpt || 
          post.content?.slice(0, 200).replace(/<[^>]*>/g, '') + '...' || '';
        
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${post.author ? `<author>${post.author.name}</author>` : ''}
      ${post.category ? `<category>${post.category.name}</category>` : ''}
    </item>`;
      })
      .join('');
    
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — Блог о займах</title>
    <link>${BASE_URL}/blog</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ru-RU</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;
    
    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[RSS] Error generating feed:', error);
    
    return new Response('Error generating RSS feed', {
      status: 500,
    });
  }
}
