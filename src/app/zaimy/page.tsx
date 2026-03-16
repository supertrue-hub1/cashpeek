import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { LOAN_CATEGORIES } from '@/lib/seo/slugs';
import { generateBreadcrumb } from '@/lib/seo/metadata';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { LoanCalculator } from '@/components/zaimy/loan-calculator';
import type { Offer } from '@/types/offer';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Займы онлайн — сравнить лучшие предложения МФО',
  description: 'Сравните лучшие займы от проверенных МФО России. Мгновенное зачисление на карту, без справок и поручителей. Выберите подходящее предложение за 5 минут.',
  alternates: {
    canonical: '/zaimy',
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

async function getAllOffers(): Promise<Offer[]> {
  try {
    const offers = await db.loanOffer.findMany({
      where: { status: 'published' },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
      ],
    });

    return offers.map(transformOffer);
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return [];
  }
}

export default async function LoansPage() {
  const offers = await getAllOffers();
  
  const breadcrumb = [
    { name: 'Главная', url: '/' },
    { name: 'Займы', url: '/zaimy' },
  ];
  
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumb(breadcrumb)) }}
      />
      
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-muted to-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Займы онлайн на карту
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">
              Сравните лучшие предложения от проверенных МФО России. 
              Мгновенное зачисление, без справок и проверок. 
              Выберите займ за 5 минут.
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                {offers.length} предложений
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                За 5 минут
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                От 0% для новых
              </Badge>
            </div>
          </div>
        </section>

        {/* Calculator + Sorting + Offers */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <LoanCalculator offers={offers} />
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-t bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Популярные категории
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(LOAN_CATEGORIES).slice(0, 10).map(([slug, category]) => (
                <Link
                  key={slug}
                  href={`/zaimy/${slug}`}
                  className="group bg-muted rounded-xl p-4 hover:bg-primary/5 hover:shadow-md transition-all border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {category.shortDesc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
