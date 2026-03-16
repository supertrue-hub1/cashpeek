import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { 
  ReadingProgress, 
  TableOfContents, 
  AuthorBio, 
  BlogCtaBox,
  PopularOffersSidebar,
  BlogCard 
} from '@/components/blog';
import { FAQSchema } from '@/components/seo/faq-schema';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatReadingTime, formatPostDate, extractHeadings, extractFAQsFromContent } from '@/lib/blog/utils';

// Disable cache
export const revalidate = 0;

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  const post = await db.blogPost.findUnique({
    where: { slug },
    include: { category: true, author: true },
  });

  if (!post) {
    return { title: 'Статья не найдена' };
  }

  return {
    title: post.metaTitle || `${post.title} | Блог`,
    description: post.metaDescription || post.excerpt || '',
    keywords: post.keywords,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

// Generate JSON-LD for SEO
function generateArticleSchema(post: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author ? {
      '@type': 'Person',
      name: post.author.name,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'CashPeek',
    },
  };
}

// Fetch post data
async function getPostData(slug: string) {
  const [post, relatedPosts, offers] = await Promise.all([
    db.blogPost.findUnique({
      where: { slug },
      include: { category: true, author: true },
    }),
    db.blogPost.findMany({
      where: { 
        status: 'published',
        slug: { not: slug },
      },
      include: { category: true },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    }),
    db.loanOffer.findMany({
      where: { 
        status: 'published',
        isFeatured: true,
      },
      take: 5,
      orderBy: { rating: 'desc' },
    }),
  ]);

  return { post, relatedPosts, offers };
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const { post, relatedPosts, offers } = await getPostData(slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  // Increment views
  await db.blogPost.update({
    where: { id: post.id },
    data: { viewsCount: { increment: 1 } },
  });

  // Extract headings for TOC
  const headings = extractHeadings(post.content);

  // Extract FAQs from content for Schema.org
  const faqs = extractFAQsFromContent(post.content);

  // Transform related posts
  const transformedRelatedPosts = relatedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    featuredImage: p.featuredImage,
    readingTime: p.readingTime,
    status: p.status as 'published',
    isFeatured: p.isFeatured,
    viewsCount: p.viewsCount,
    likesCount: p.likesCount,
    publishedAt: p.publishedAt?.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      color: p.category.color,
    } : undefined,
  }));

  // Transform offers
  const transformedOffers = offers.map((offer) => ({
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    rating: offer.rating,
    maxAmount: offer.maxAmount,
    firstLoanRate: offer.firstLoanRate ?? undefined,
    decisionTime: offer.decisionTime,
  }));

  const categoryColor = post.category?.color || '#10b981';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* JSON-LD Schema - Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleSchema(post)) }}
      />
      
      {/* JSON-LD Schema - FAQ (if any) */}
      {faqs.length > 0 && <FAQSchema items={faqs} />}
      
      <Header />
      
      {/* Reading Progress */}
      <ReadingProgress />
      
      <main className="flex-1">
        {/* Hero */}
        <header className="bg-gradient-to-b from-muted to-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/blog" className="hover:text-primary transition-colors">Блог</Link>
              {post.category && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link
                    href={`/blog?category=${post.category.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium truncate max-w-[200px]">{post.title}</span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.category && (
                <Badge 
                  style={{ backgroundColor: categoryColor }}
                  className="text-white border-0"
                >
                  {post.category.name}
                </Badge>
              )}
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatReadingTime(post.readingTime)}
              </span>
              {post.viewsCount > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {post.viewsCount + 1} просмотров
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatPostDate(post.publishedAt)}
                </span>
              )}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground max-w-3xl">
                {post.excerpt}
              </p>
            )}
            
            {/* Author */}
            {post.author && (
              <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {post.author.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-foreground">{post.author.name}</div>
                  {post.author.role && (
                    <div className="text-sm text-muted-foreground">{post.author.role}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Article Content */}
            <article>
              {/* Table of Contents - Inside article on mobile */}
              {headings.length > 0 && (
                <div className="lg:hidden mb-8 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3 text-foreground">Содержание</h3>
                  <TableOfContents items={headings} />
                </div>
              )}
              
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* CTA Box - After intro */}
              <BlogCtaBox 
                variant="inline"
                title="Нужен займ?"
                description="Сравните лучшие предложения от проверенных МФО"
                offers={transformedOffers.slice(0, 3)}
                className="mb-8"
              />
              
              {/* Content with prose styling */}
              <div 
                className="prose prose-slate prose-lg max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                  prose-li:marker:text-muted-foreground/50
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted prose-blockquote:py-1
                  prose-img:rounded-xl prose-img:shadow-sm prose-img:max-w-full prose-img:h-auto prose-img:w-full
                "
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              {/* CTA Box - Bottom */}
              <BlogCtaBox 
                variant="bottom"
                title="Готовы выбрать займ?"
                description="Сравните условия лучших МФО и получите деньги уже сегодня"
                className="mt-12"
              />
              
              {/* Author Bio */}
              {post.author && (
                <div className="mt-12">
                  <AuthorBio author={{
                    id: post.author.id,
                    name: post.author.name,
                    slug: post.author.slug,
                    avatar: post.author.avatar || undefined,
                    bio: post.author.bio || undefined,
                    role: post.author.role || undefined,
                    socialLinks: post.author.socialLinks ? JSON.parse(post.author.socialLinks) : undefined,
                  }} />
                </div>
              )}
            </article>

            {/* Right Sidebar */}
            <aside className="space-y-6">
              {/* Table of Contents - Desktop */}
              {headings.length > 0 && (
                <div className="hidden lg:block sticky top-24">
                  <TableOfContents items={headings} />
                  
                  {/* Back to blog */}
                  <Link 
                    href="/blog"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-8"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Все статьи
                  </Link>
                </div>
              )}
              
              {/* Popular Offers */}
              <PopularOffersSidebar offers={transformedOffers} />
            </aside>
          </div>
        </div>

        {/* Related Posts */}
        {transformedRelatedPosts.length > 0 && (
          <section className="py-12 md:py-16 bg-muted border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Похожие статьи
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {transformedRelatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
