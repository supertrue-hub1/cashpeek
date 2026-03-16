import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { ChevronRight, ArrowLeft } from 'lucide-react';
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
    title: `Заявка на займ в ${mfo.name} — оформить онлайн`,
    description: `Подайте заявку на займ в ${mfo.name} через наш сервис. Быстрое рассмотрение, мгновенное зачисление.`,
    alternates: {
      canonical: `/mfo/${slug}/zayavka`,
    },
  };
}

async function getMfoData(slug: string) {
  const mfo = await db.loanOffer.findUnique({
    where: { slug, status: 'published' },
  });
  
  return mfo;
}

export default async function MfoApplicationPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const mfo = await getMfoData(slug);
  
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
              <span className="text-foreground font-medium">Заявка</span>
            </nav>
            
            <div className="flex items-center gap-4">
              {mfo.logo && (
                <img src={mfo.logo} alt={mfo.name} className="w-12 h-12 object-contain" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Заявка на займ в {mfo.name}
                </h1>
                <p className="text-muted-foreground">
                  Заполните форму для отправки заявки
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <div className="bg-slate-50 rounded-xl p-6">
              <p className="text-center text-muted-foreground mb-6">
                Форма заявки будет доступна после интеграции с API МФО.
              </p>
              
              <div className="text-center">
                <a 
                  href={mfo.website || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Перейти на сайт {mfo.name}
                </a>
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href={`/mfo/${slug}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Вернуться к обзору
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
