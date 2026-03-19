import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { SEOLoanPage } from '@/components/seo-loan-page';
import { Moon, Sun, Clock, CheckCircle, Zap } from 'lucide-react';
import type { Offer } from '@/types/offer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Круглосуточные займы — деньги в любое время | МФО 24/7',
  description: 'Круглосуточные займы онлайн — оформите заявку в любое время суток. Ночная выдача займов, работаем без выходных. Мгновенное решение, деньги на карту за 15 минут.',
  keywords: 'круглосуточные займы, займы 24/7, ночные займы, займ круглосуточно, займ ночью, займы без выходных',
  alternates: {
    canonical: '/zaimy-kruglosutochno',
  },
  openGraph: {
    title: 'Круглосуточные займы — деньги в любое время',
    description: 'Оформите займ днём или ночью — работаем 24/7. Мгновенное решение, деньги на карту.',
    url: '/zaimy-kruglosutochno',
  },
};

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

export default async function RoundTheClockLoansPage() {
  const allOffers = await getOffers();

  // Filter: round the clock (on server)
  const offers = allOffers.filter(offer => offer.roundTheClock === true);

  const features = [
    {
      icon: <Moon className="h-5 w-5 text-primary" />,
      title: 'Ночная выдача',
      description: 'Оформите и получите займ в любое время — хоть в 3 часа ночи.',
    },
    {
      icon: <Sun className="h-5 w-5 text-yellow-600" />,
      title: 'Без выходных',
      description: 'Работаем каждый день, включая праздники и выходные.',
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      title: '24/7 онлайн',
      description: 'Весь процесс онлайн — от заявки до получения денег на карту.',
    },
    {
      icon: <Zap className="h-5 w-5 text-green-600" />,
      title: 'Быстрое решение',
      description: 'Автоматическое одобрение за 5-15 минут в любое время суток.',
    },
  ];

  const faq = [
    {
      question: 'Можно ли получить займ ночью?',
      answer: 'Да, многие МФО работают круглосуточно и выдают займы даже ночью. Заявка рассматривается автоматически, поэтому вы можете получить деньги в 3 часа ночи так же быстро, как и днём.',
    },
    {
      question: 'Как быстро придут деньги ночью?',
      answer: 'При автоматическом одобрении деньги поступают на карту сразу — обычно за 1-5 минут. В редких случаях ночью перевод может занять до 15-30 минут.',
    },
    {
      question: 'Работают ли МФО в выходные?',
      answer: 'Да, круглосуточные МФО работают без выходных и праздников. Вы можете оформить заявку в субботу, воскресенье или любой праздничный день.',
    },
    {
      question: 'Чем отличается ночной займ от обычного?',
      answer: 'Условия займа те же. Единственное отличие — ночью заявка рассматривается полностью автоматически, без участия менеджеров. Это даже ускоряет процесс.',
    },
    {
      question: 'Какие документы нужны для ночного займа?',
      answer: 'Те же, что и для обычного — паспорт гражданина РФ и банковская карта. Справки и поручители не требуются.',
    },
  ];

  const contentBefore = (
    <section className="bg-gradient-to-b from-indigo-50 to-background dark:from-indigo-950/20 border-b">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-600">Работаем 24/7</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Круглосуточные займы — деньги в любое время
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-6">
          Оформите займ онлайн днём или ночью — работаем 24/7 без выходных. 
          Автоматическое одобрение, деньги на карту за 15 минут. 
          Нужны деньги в 3 часа ночи? Без проблем!
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
            <Moon className="h-4 w-4" />
            Ночная выдача
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
            <Sun className="h-4 w-4" />
            Без выходных
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="h-4 w-4" />
            Авто-одобрение
          </span>
        </div>
      </div>
    </section>
  );

  const contentAfter = (
    <section className="py-8 border-t bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Как получить займ ночью?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Круглосуточные займы — удобное решение, когда деньги нужны срочно в нерабочее время. 
            МФО с автоматическим одобрением работают 24/7.
          </p>
          <ol className="mt-4 space-y-2">
            <li><strong>Выберите МФО</strong> — из списка круглосуточных организаций</li>
            <li><strong>Оформите заявку</strong> — процесс такой же, как и днём</li>
            <li><strong>Получите решение</strong> — автоматически за 5-15 минут</li>
            <li><strong>Заберите деньги</strong> — на карту, обычно мгновенно</li>
          </ol>
          <p className="mt-4">
            <strong>Преимущества ночного займа:</strong> автоматическое рассмотрение без участия менеджеров, 
            мгновенный перевод на карту, те же условия, что и днём.
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
          title="Круглосуточные займы"
          description="Деньги в любое время суток — 24/7"
          keywords={['круглосуточные займы', 'займы 24/7', 'ночные займы', 'займ ночью']}
          h1="Круглосуточные займы — деньги в любое время"
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
