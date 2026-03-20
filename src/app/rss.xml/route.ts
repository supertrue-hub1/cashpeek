import { RSS } from 'next'
import { db } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru'

/**
 * RSS Feed для блога
 * Доступен по адресу: /rss.xml
 */
export async function GET() {
  const posts = await db.blogPost.findMany({
    where: {
      published: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 20,
    include: {
      author: true,
      category: true,
    },
  })

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CashPeek Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Статьи о займах, микрофинансировании и личных финансах</description>
    <language>ru-ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map((post) => {
        const postUrl = `${BASE_URL}/blog/${post.slug}`
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt || post.metaDescription || ''}]]></description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
      <author>${post.author?.name || 'CashPeek'}</author>
      ${post.category ? `<category>${post.category.name}</category>` : ''}
    </item>`
      })
      .join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
