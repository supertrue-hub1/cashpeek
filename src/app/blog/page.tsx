import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { 
  BlogCard, 
  CategoryFilter, 
  PopularOffersSidebar,
  BlogCtaBox 
} from '@/components/blog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight, CreditCard, PiggyBank, AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';

// Disable cache for fresh data
export const revalidate = 0;

// Fetch data from DB
async function getBlogData() {
  const [posts, categories, offers] = await Promise.all([
    // Get published posts
    db.blogPost.findMany({
      where: { status: 'published' },
      include: { category: true, author: true },
      orderBy: [
        { isFeatured: 'desc' },
        { publishedAt: 'desc' },
      ],
    }),
    // Get active categories with post count
    db.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { posts: { where: { status: 'published' } } } },
      },
    }),
    // Get featured offers for sidebar
    db.loanOffer.findMany({
      where: { 
        status: 'published',
        isFeatured: true,
      },
      take: 5,
      orderBy: { rating: 'desc' },
    }),
  ]);

  return { posts, categories, offers };
}

export default async function BlogPage() {
  const { posts, categories, offers } = await getBlogData();

  // Transform posts for frontend
  const transformedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featuredImage,
    readingTime: post.readingTime,
    status: post.status as 'published',
    isFeatured: post.isFeatured,
    viewsCount: post.viewsCount,
    likesCount: post.likesCount,
    publishedAt: post.publishedAt?.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    category: post.category ? {
      id: post.category.id,
      name: post.category.name,
      slug: post.category.slug,
      color: post.category.color,
      icon: post.category.icon,
    } : undefined,
    author: post.author ? {
      id: post.author.id,
      name: post.author.name,
      slug: post.author.slug,
      avatar: post.author.avatar,
      role: post.author.role,
    } : undefined,
  }));

  // Transform categories
  const transformedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || undefined,
    color: cat.color || undefined,
    icon: cat.icon || undefined,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    postCount: cat._count.posts,
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

  const featuredPosts = transformedPosts.filter(p => p.isFeatured);
  const regularPosts = transformedPosts.filter(p => !p.isFeatured);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-background to-muted/30 border-b py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Блог</span>
            </div>
            
            {/* Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900">
                <BookOpen className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Блог о финансах
                </h1>
                <p className="text-muted-foreground mt-1">
                  Экспертные статьи о займах, финансовой грамотности и управлении деньгами
                </p>
              </div>
            </div>
            
            {/* Categories */}
            {transformedCategories.length > 0 && (
              <div className="mt-8">
                <CategoryFilter categories={transformedCategories} />
              </div>
            )}
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Рекомендуемые статьи
              </h2>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {featuredPosts.slice(0, 2).map((post) => (
                  <BlogCard key={post.id} post={post} variant="featured" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Posts Grid */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Все статьи
                </h2>
                
                {regularPosts.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {regularPosts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-background rounded-xl border">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">Статьи скоро появятся</h3>
                    <p className="text-sm text-muted-foreground">
                      Мы готовим для вас полезные материалы о финансах
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Popular Offers */}
                <PopularOffersSidebar offers={transformedOffers} />
                
                {/* Newsletter */}
                <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950 dark:to-background">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      Подписка
                    </CardTitle>
                    <CardDescription>
                      Получайте новые статьи на почту
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <input
                      type="email"
                      placeholder="Ваш email"
                      className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Подписаться
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Полезные ссылки</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link 
                      href="/sravnit" 
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">Сравнить займы</span>
                    </Link>
                    <Link 
                      href="/#offers" 
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <PiggyBank className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">Лучшие предложения</span>
                    </Link>
                    <Link 
                      href="/#faq" 
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <AlertCircle className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground">Частые вопросы</span>
                    </Link>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 md:py-16 bg-background border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <BlogCtaBox 
              variant="bottom"
              title="Ищете выгодный займ?"
              description="Сравните условия лучших МФО и выберите оптимальное предложение"
              offers={transformedOffers}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
