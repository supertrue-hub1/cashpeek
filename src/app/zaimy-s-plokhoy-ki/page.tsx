import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { SEOLoanPage } from '@/components/seo-loan-page';
import { ShieldCheck, CheckCircle, Zap, AlertCircle } from 'lucide-react';
import type { Offer } from '@/types/offer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Займы с плохой кредитной историей — одобрение 95% | МФО без проверки КИ',
  description: 'Получите займ даже с плохой кредитной историей. МФО с высоким процентом одобрения, без проверки БКИ. Деньги на карту за 15 минут.',
  keywords: 'займы с плохой кредитной историей, займы с плохой КИ, займ без проверки КИ, микрозайм с просрочками, займ без отказа',
  alternates: {
    canonical: '/zaimy-s-plokhoy-ki',
  },
  openGraph: {
    title: 'Займы с плохой кредитной историей — одобрение 95%',
    description: 'Получите деньги даже с просрочками и долгами. МФО одобряют без проверки кредитной истории.',
    url: '/zaimy-s-plokhoy-ki',
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

export default async function BadCreditLoansPage() {
  const offers = await getOffers();

  // Filter: bad credit OK
  const filterFn = (offer: Offer) => offer.badCreditOk === true;

  const features = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      title: 'Без проверки КИ',
      description: 'МФО не запрашивают кредитную историю или лояльно относятся к просрочкам.',
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'Высокое одобрение',
      description: 'Процент одобрения достигает 95% даже при наличии долгов в прошлом.',
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      title: 'Быстрое решение',
      description: 'Заявка рассматривается за 5-15 минут. Деньги поступают сразу после одобрения.',
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
      title: 'Исправление КИ',
      description: 'Своевременный возврат займа помогает улучшить кредитную историю.',
    },
  ];

  const faq = [
    {
      question: 'Дадут ли займ с плохой кредитной историей?',
      answer: 'Да, многие МФО одобряют займы даже при наличии просрочек и негативной кредитной истории. Такие организации лояльно относятся к заёмщикам и оценивают не только КИ, но и текущую платёжеспособность.',
    },
    {
      question: 'Проверяют ли кредитную историю?',
      answer: 'Некоторые МФО не запрашивают кредитную историю вовсе. Другие проверяют её, но не считают негативную КИ причиной для отказа. Главное — иметь постоянный источник дохода.',
    },
    {
      question: 'Как повысить шанс на одобрение?',
      answer: 'Укажите достоверные данные, подтвердите доход, предоставьте дополнительные контакты. Также можно сначала обратиться в МФО с самым высоким процентом одобрения, а затем — в другие организации.',
    },
    {
      question: 'Можно ли исправить кредитную историю?',
      answer: 'Да. При своевременном возврате займа МФО передаёт информацию в БКИ. Это положительно влияет на кредитный рейтинг и повышает шанс на получение кредитов в будущем.',
    },
    {
      question: 'Какие документы нужны?',
      answer: 'Обычно достаточно паспорта гражданина РФ. Иногда могут потребоваться СНИЛС или ИНН. Справка о доходах не требуется.',
    },
  ];

  const contentBefore = (
    <section className="bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 border-b">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Лояльное отношение к КИ</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Займы с плохой кредитной историей
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-6">
          Получите деньги даже при наличии просрочек и долгов. 
          МФО с высоким процентом одобрения — до 95% заявок получают положительное решение.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="h-4 w-4" />
            До 95% одобрение
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
            <Zap className="h-4 w-4" />
            За 15 минут
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            <ShieldCheck className="h-4 w-4" />
            Без проверки БКИ
          </span>
        </div>
      </div>
    </section>
  );

  const contentAfter = (
    <section className="py-8 border-t bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Как получить займ с плохой КИ?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Плохая кредитная история — не приговор. Многие микрофинансовые организации 
            специализируются на работе с заёмщиками, у которых были просрочки или долги.
          </p>
          <p className="mt-4">
            <strong>Почему МФО одобряют:</strong> организации оценивают не только КИ, 
            но и текущую платёжеспособность заёмщика. Если у вас есть стабильный доход, 
            шанс на одобрение высок.
          </p>
          <p className="mt-4">
            <strong>Совет:</strong> начните с небольших сумм и всегда возвращайте займ вовремя. 
            Так вы не только получите нужные деньги, но и улучшите свою кредитную историю.
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
          title="Займы с плохой КИ"
          description="Одобрение до 95% даже с просрочками"
          keywords={['займы с плохой КИ', 'займ без проверки КИ', 'микрозайм с просрочками']}
          h1="Займы с плохой кредитной историей"
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
