import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { SEOLoanPage } from '@/components/seo-loan-page';
import { PhoneOff, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import type { Offer } from '@/types/offer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Займы без звонков — оформление онлайн без подтверждения | МФО без звонков',
  description: 'Займы без звонков оператора и подтверждения. Оформление полностью онлайн, без звонков на работу и родственникам. Деньги на карту за 15 минут.',
  keywords: 'займы без звонков, займ без подтверждения, займ без звонков на работу, тихий займ, займ по паспорту',
  alternates: {
    canonical: '/zaimy-bez-zvonkov',
  },
  openGraph: {
    title: 'Займы без звонков — оформление онлайн без подтверждения',
    description: 'Получите займ без звонков оператора и подтверждения. Без звонков на работу и родственникам.',
    url: '/zaimy-bez-zvonkov',
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

export default async function NoCallsLoansPage() {
  const allOffers = await getOffers();

  // Filter: no calls (on server)
  const offers = allOffers.filter(offer => offer.noCalls === true);

  const features = [
    {
      icon: <PhoneOff className="h-5 w-5 text-primary" />,
      title: 'Без звонков',
      description: 'Оператор не звонит вам, на работу или родственникам. Полная конфиденциальность.',
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'Автоматическое решение',
      description: 'Заявка рассматривается автоматически без участия менеджеров.',
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      title: 'Быстрое оформление',
      description: 'Весь процесс занимает 5-10 минут. Деньги поступают на карту сразу.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
      title: 'Без поручителей',
      description: 'Не нужны поручители, справки с работы или подтверждение дохода.',
    },
  ];

  const faq = [
    {
      question: 'Что значит займ без звонков?',
      answer: 'Это займ, который оформляется полностью онлайн без звонков от менеджеров МФО. Оператор не связывается с вами, не звонит на работу или родственникам. Решение принимается автоматически.',
    },
    {
      question: 'Почему МФО не звонят?',
      answer: 'Некоторые организации используют автоматическую скоринговую систему, которая оценивает заёмщика без участия менеджеров. Это ускоряет процесс и обеспечивает конфиденциальность.',
    },
    {
      question: 'Нужен ли подтверждение дохода?',
      answer: 'Нет, для займов без звонков не требуются справки о доходах. Достаточно указать данные паспорта и привязать банковскую карту.',
    },
    {
      question: 'Как быстро придут деньги?',
      answer: 'После автоматического одобрения деньги поступают на карту мгновенно или в течение 15 минут. Весь процесс от заявки до получения занимает 5-15 минут.',
    },
    {
      question: 'Можно ли получить займ ночью?',
      answer: 'Да, многие МФО с автоматическим одобрением работают круглосуточно. Вы можете оформить заявку в любое время — днём, вечером или ночью.',
    },
  ];

  const contentBefore = (
    <section className="bg-gradient-to-b from-purple-50 to-background dark:from-purple-950/20 border-b">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <PhoneOff className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">Полная конфиденциальность</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Займы без звонков — оформление онлайн без подтверждения
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-6">
          Получите займ без звонков оператора и подтверждения. 
          Никто не будет беспокоить вас, ваших коллег или родственников. 
          Полностью автоматическое одобрение за 5 минут.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
            <PhoneOff className="h-4 w-4" />
            Без звонков
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
            <Zap className="h-4 w-4" />
            Авто-одобрение
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="h-4 w-4" />
            Конфиденциально
          </span>
        </div>
      </div>
    </section>
  );

  const contentAfter = (
    <section className="py-8 border-t bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Как оформить займ без звонков?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Займы без звонков — удобный способ получить деньги с максимальной конфиденциальностью. 
            Весь процесс происходит онлайн, без участия менеджеров.
          </p>
          <ol className="mt-4 space-y-2">
            <li><strong>Выберите МФО</strong> — из списка организаций с автоматическим одобрением</li>
            <li><strong>Заполните заявку</strong> — укажите данные паспорта и привяжите карту</li>
            <li><strong>Получите решение</strong> — автоматически за 1-5 минут</li>
            <li><strong>Заберите деньги</strong> — средства поступят на карту мгновенно</li>
          </ol>
          <p className="mt-4">
            Важно: указывайте достоверные данные. Автоматическая система проверяет информацию 
            и может отказать при обнаружении неточностей.
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
          title="Займы без звонков"
          description="Оформление онлайн без подтверждения"
          keywords={['займы без звонков', 'займ без подтверждения', 'тихий займ']}
          h1="Займы без звонков — оформление онлайн без подтверждения"
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
