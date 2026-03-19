import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { SEOLoanPage } from '@/components/seo-loan-page';
import { Sparkles, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import type { Offer } from '@/types/offer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Займы без процентов — первый займ под 0% | Сравнить МФО онлайн',
  description: 'Первый займ без процентов от проверенных МФО. Сравните 0% предложения, выберите лучший вариант и получите деньги на карту за 15 минут. Без скрытых комиссий.',
  keywords: 'займы без процентов, займ под 0%, первый займ бесплатно, займы 0 процентов, бесплатный займ, займ без переплаты',
  alternates: {
    canonical: '/zaimy-bez-protsentov',
  },
  openGraph: {
    title: 'Займы без процентов — первый займ под 0%',
    description: 'Получите первый займ бесплатно. Акции от МФО с нулевой ставкой. Без переплат и скрытых комиссий.',
    url: '/zaimy-bez-protsentov',
  },
};

// Transform DB offer
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

async function getOffers(): Promise<Offer[]> {
  try {
    const offers = await db.loanOffer.findMany({
      where: { status: 'published' },
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
    });
    return offers.map(transformOffer);
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return [];
  }
}

export default async function ZeroPercentLoansPage() {
  const offers = await getOffers();

  // Filter: first loan with 0% rate
  const filterFn = (offer: Offer) => offer.firstLoanRate === 0;

  const features = [
    {
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      title: '0% переплаты',
      description: 'При своевременном возврате вы платите ровно ту сумму, которую взяли.',
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'Без скрытых комиссий',
      description: 'Прозрачные условия — никаких дополнительных платежей за оформление или выдачу.',
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      title: 'Быстрое оформление',
      description: 'Заявка рассматривается за 1-5 минут. Деньги поступают на карту мгновенно.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
      title: 'Надёжные МФО',
      description: 'Все организации имеют лицензию ЦБ РФ и входят в реестр микрофинансовых организаций.',
    },
  ];

  const faq = [
    {
      question: 'Что такое займ под 0%?',
      answer: 'Это акция для новых клиентов МФО. Если вы впервые обращаетесь в организацию и вовремя возвращаете займ, проценты не начисляются. Вы платите ровно ту сумму, которую взяли.',
    },
    {
      question: 'Кому доступен займ без процентов?',
      answer: 'Акция доступна новым клиентам — тем, кто ранее не брал займы в конкретной МФО. Требования: возраст от 18 лет, гражданство РФ, постоянная регистрация, действующая банковская карта.',
    },
    {
      question: 'Какой максимальный срок займа под 0%?',
      answer: 'Срок зависит от конкретной МФО, обычно от 7 до 30 дней. Важно вернуть займ точно в срок — при просрочке начисляются проценты по базовой ставке.',
    },
    {
      question: 'Можно ли продлить займ под 0%?',
      answer: 'Некоторые МФО позволяют продлить срок займа. Условия пролонгации лучше уточнять в конкретной организации — обычно это платная услуга.',
    },
    {
      question: 'Что будет при просрочке?',
      answer: 'При нарушении сроков возврата акция 0% аннулируется. На сумму займа начисляются проценты по базовой ставке (обычно 0.8% в день). Рекомендуем возвращать займ вовремя.',
    },
  ];

  const contentBefore = (
    <section className="bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 border-b">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Акция для новых клиентов</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Займы без процентов — первый займ под 0%
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-6">
          Сравните предложения МФО с нулевой ставкой для новых заёмщиков. 
          Получите деньги на карту и верните ровно столько, сколько взяли — без переплаты.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="h-4 w-4" />
            Без переплаты
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
            <Zap className="h-4 w-4" />
            За 5 минут
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            <ShieldCheck className="h-4 w-4" />
            Проверенные МФО
          </span>
        </div>
      </div>
    </section>
  );

  const contentAfter = (
    <section className="py-8 border-t bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Как получить займ без процентов?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Займы под 0% — это отличная возможность получить деньги без переплаты. 
            Такая акция действует для новых клиентов большинства МФО. 
            Чтобы воспользоваться предложением:
          </p>
          <ol className="mt-4 space-y-2">
            <li><strong>Выберите МФО</strong> — сравните условия и выберите подходящий вариант</li>
            <li><strong>Оформите заявку</strong> — заполните анкету на сайте организации</li>
            <li><strong>Получите деньги</strong> — средства поступят на карту за 1-15 минут</li>
            <li><strong>Верните вовремя</strong> — погасите займ точно в срок, чтобы не платить проценты</li>
          </ol>
          <p className="mt-4">
            Важно: акция 0% действует только при своевременном возврате займа. 
            При просрочке начисляются проценты по базовой ставке.
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <SEOLoanPage
          offers={offers}
          title="Займы без процентов"
          description="Первый займ под 0% для новых клиентов"
          keywords={['займы без процентов', 'займ под 0%', 'первый займ бесплатно']}
          h1="Займы без процентов — первый займ под 0%"
          filterFn={filterFn}
          features={features}
          faq={faq}
          contentBefore={contentBefore}
          contentAfter={contentAfter}
        />
      </main>
      <Footer />
    </div>
  );
}
