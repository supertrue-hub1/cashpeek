import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { OffersGrid } from '@/components/offers';
import { Badge } from '@/components/ui/badge';
import { Calculator, Clock, Coins, Star } from 'lucide-react';
import type { Offer } from '@/types/offer';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Сравнение займов — выберите лучший займ онлайн',
  description: 'Сравните условия займов от разных МФО. Найдите выгодное предложение с минимальной ставкой и высоким процентом одобрения.',
  alternates: {
    canonical: '/sravnit',
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

export default async function ComparePage() {
  const offers = await getAllOffers();
  
  // Calculate stats
  const zeroPercentOffers = offers.filter(o => o.firstLoanRate === 0);
  const avgRating = offers.length > 0 
    ? (offers.reduce((sum, o) => sum + o.rating, 0) / offers.length).toFixed(1)
    : '0';
  const maxAmount = Math.max(...offers.map(o => o.maxAmount), 0);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-background border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Сравнение займов</h1>
                <p className="text-sm text-muted-foreground">
                  {offers.length} предложений от проверенных МФО
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Coins className="h-4 w-4 text-primary" />
                  Макс. сумма
                </div>
                <div className="text-xl font-bold text-foreground">
                  {maxAmount.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  Срок
                </div>
                <div className="text-xl font-bold text-foreground">
                  до 30 дней
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Star className="h-4 w-4 text-primary" />
                  Средний рейтинг
                </div>
                <div className="text-xl font-bold text-foreground">
                  {avgRating}
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    0%
                  </Badge>
                  Под 0%
                </div>
                <div className="text-xl font-bold text-foreground">
                  {zeroPercentOffers.length} МФО
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hot Offers Banner */}
        {zeroPercentOffers.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl p-4 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                  0% первый займ
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{zeroPercentOffers.length} МФО</span> предлагают первый займ под 0% — без переплаты при своевременном погашении
              </p>
            </div>
          </section>
        )}

        {/* Offers Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Все предложения
            </h2>
            <p className="text-sm text-muted-foreground">
              Нажмите «Подробнее» для просмотра всех условий
            </p>
          </div>

          {offers.length > 0 ? (
            <OffersGrid
              offers={offers}
              featuredIds={offers.filter((o) => o.isFeatured).map((o) => o.id)}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Загрузка предложений...
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

