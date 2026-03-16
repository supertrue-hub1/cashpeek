import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  HeroSection,
  ScenarioSection,
  OffersSection,
  CompareLoansSection,
  TrustSection,
  FAQSection,
  SEOSection,
} from '@/components/sections';
import { scenarios, faqItems } from '@/data/mock-offers';
import { db } from '@/lib/db';
import type { Offer } from '@/types/offer';

// Disable cache - always fetch fresh data from DB
export const revalidate = 0;

// Transform DB offer to frontend Offer type
function transformOffer(offer: any): Offer {
  // Безопасный парсинг JSON полей
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

// Server component - fetches offers from DB
async function getOffers(): Promise<Offer[]> {
  try {
    const offers = await db.loanOffer.findMany({
      where: { 
        status: 'published',
        showOnHomepage: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { rating: 'desc' },
      ],
    });

    return offers.map(transformOffer);
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return [];
  }
}

export default async function Home() {
  const offers = await getOffers();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <ScenarioSection scenarios={scenarios} />
        {offers.length > 0 ? (
          <>
            <OffersSection offers={offers} />
            <CompareLoansSection offers={offers} />
          </>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>Загрузка предложений...</p>
          </div>
        )}
        <TrustSection />
        <FAQSection items={faqItems} />
        <SEOSection />
      </main>
      
      <Footer />
    </div>
  );
}
