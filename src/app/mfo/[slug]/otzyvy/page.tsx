import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { generateMfoMetadata } from '@/lib/seo/metadata';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export async function generateStaticParams() {
  const mfos = await db.loanOffer.findMany({
    where: { status: 'published' },
    select: { slug: true },
    take: 100,
  });
  
  return mfos.map(mfo => ({ slug: mfo.slug }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  const mfo = await db.loanOffer.findUnique({
    where: { slug, status: 'published' },
  });
  
  if (!mfo) {
    return { title: 'МФО не найдено' };
  }
  
  return {
    title: `Отзывы о ${mfo.name} — реальные отзывы клиентов`,
    description: `Читайте отзывы о ${mfo.name}. Реальные мнения заёмщиков о качестве услуг, скорости выдачи и условиях займов.`,
    alternates: {
      canonical: `/mfo/${slug}/otzyvy`,
    },
  };
}

async function getMfoWithReviews(slug: string) {
  const mfo = await db.loanOffer.findUnique({
    where: { slug, status: 'published' },
  });
  
  // Здесь можно добавить выборку отзывов из БД
  const reviews = [];
  
  return { mfo, reviews };
}

export default async function MfoReviewsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const { mfo, reviews } = await getMfoWithReviews(slug);
  
  if (!mfo) {
    notFound();
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/mfo" className="hover:text-primary transition-colors">МФО</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/mfo/${slug}`} className="hover:text-primary transition-colors">{mfo.name}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">Отзывы</span>
            </nav>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Отзывы о {mfo.name}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= Math.round(mfo.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="font-semibold">{mfo.rating}/5</span>
              <span className="text-muted-foreground">({reviews.length || 0} отзывов)</span>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review: any) => (
                  <div key={review.id} className="bg-slate-50 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-foreground">{review.author}</div>
                        <div className="text-sm text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 mb-3">{review.text}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-green-600 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        Полезно ({review.likes || 0})
                      </button>
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-red-600 transition-colors">
                        <ThumbsDown className="h-4 w-4" />
                        Не полезно
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Отзывов пока нет
                </h2>
                <p className="text-muted-foreground mb-6">
                  Будьте первым, кто оставит отзыв о {mfo.name}
                </p>
                <Button>Оставить отзыв</Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
