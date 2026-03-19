import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { generateBreadcrumb } from '@/lib/seo/metadata';
import { MfoListWithPagination } from '@/components/mfo-list-with-pagination';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Offer } from '@/types/offer';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'МФО России — все микрофинансовые организации',
  description: 'Полный список проверенных МФО России. Рейтинг, отзывы, условия займов. Выберите надёжного кредитора для получения денег.',
  alternates: {
    canonical: '/mfo',
  },
};

// Transform DB offer to frontend Offer type
function transformOffer(offer: any): Offer {
  const parseJsonArray = (value: unknown, defaultValue: string[] = []): string[] => {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  return {
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    logo: offer.logo || undefined,
    rating: offer.rating,
    minAmount: offer.minAmount,
    maxAmount: offer.maxAmount,
    minTerm: offer.minTerm || 1,
    maxTerm: offer.maxTerm || 30,
    baseRate: offer.baseRate || 0.8,
    firstLoanRate: offer.firstLoanRate ?? undefined,
    decisionTime: offer.decisionTime || 15,
    approvalRate: offer.approvalRate || 85,
    payoutMethods: parseJsonArray(offer.payoutMethods, ['card']) as import('@/types/offer').PayoutMethod[],
    features: parseJsonArray(offer.features, ['online_approval']) as import('@/types/offer').OfferFeature[],
    badCreditOk: offer.badCreditOk ?? false,
    noCalls: offer.noCalls ?? false,
    roundTheClock: offer.roundTheClock ?? false,
    minAge: offer.minAge || 18,
    documents: parseJsonArray(offer.documents, ['passport']) as import('@/types/offer').DocumentRequirement[],
    editorNote: offer.customDescription || offer.editorNote || undefined,
    affiliateUrl: offer.affiliateUrl || '#',
    isFeatured: offer.isFeatured ?? false,
    isNew: offer.isNew ?? false,
    isPopular: offer.isPopular ?? false,
  };
}

async function getAllMfos(): Promise<Offer[]> {
  try {
    const mfos = await db.loanOffer.findMany({
      where: { status: 'published' },
      orderBy: { rating: 'desc' },
    });
    
    return mfos.map(transformOffer);
  } catch (error) {
    console.error('Failed to fetch MFOs:', error);
    return [];
  }
}

export default async function MfoListPage() {
  const mfos = await getAllMfos();
  
  const breadcrumb = [
    { name: 'Главная', url: '/' },
    { name: 'МФО', url: '/mfo' },
  ];
  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumb(breadcrumb)) }}
      />
      
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-b from-slate-50 to-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">МФО</span>
            </nav>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Все МФО России
            </h1>
            
            <p className="text-lg text-slate-600 max-w-3xl mb-6">
              Сравните {mfos.length} микрофинансовых организаций. 
              Выберите надёжного кредитора с лучшими условиями и высоким рейтингом.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск МФО..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-6 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{mfos.length}</Badge>
                <span className="text-sm text-muted-foreground">МФО в каталоге</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">24/7</Badge>
                <span className="text-sm text-muted-foreground">Работают круглосуточно</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">5 мин</Badge>
                <span className="text-sm text-muted-foreground">Среднее время заявки</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Все организации
              </h2>
              <p className="text-muted-foreground">
                Полный каталог микрофинансовых организаций России
              </p>
            </div>
            
            {/* MFO Grid */}
            <MfoListWithPagination mfos={mfos} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
