import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { SEOLoanPage } from '@/components/seo-loan-page';
import { Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Offer } from '@/types/offer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Срочные займы — деньги за 5 минут | Мгновенное одобрение онлайн',
  description: 'Срочные займы за 5 минут. Мгновенное решение, деньги на карту сразу. Без справок и поручителей. Только проверенные МФО с быстрым одобрением.',
  keywords: 'срочные займы, срочный займ, займ за 5 минут, мгновенный займ, быстрый займ, экспресс займ',
  alternates: {
    canonical: '/srochnye-zaimy',
  },
  openGraph: {
    title: 'Срочные займы — деньги за 5 минут',
    description: 'Получите деньги мгновенно. Решение за 5 минут, зачисление на карту сразу.',
    url: '/srochnye-zaimy',
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

export default async function UrgentLoansPage() {
  const offers = await getOffers();

  // Filter: fast approval (decision time <= 10 minutes)
  const filterFn = (offer: Offer) => offer.decisionTime <= 10;

  const features = [
    {
      icon: <Zap className="h-5 w-5 text-primary" />,
      title: 'За 5 минут',
      description: 'Решение по заявке принимается за 5-10 минут. Многие МФО одобряют мгновенно.',
    },
    {
      icon: <Clock className="h-5 w-5 text-yellow-600" />,
      title: 'Мгновенный перевод',
      description: 'После одобрения деньги сразу поступают на вашу банковскую карту.',
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'Высокое одобрение',
      description: 'Процент одобрения достигает 95%. Шанс получить деньги очень высокий.',
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-blue-600" />,
      title: 'Без лишних документов',
      description: 'Достаточно паспорта. Справки о доходах и поручители не требуются.',
    },
  ];

  const faq = [
    {
      question: 'Как быстро дают займ?',
      answer: 'Большинство МФО рассматривают заявку за 5-15 минут. Некоторые организации принимают решение мгновенно — за 1-2 минуты. После одобрения деньги поступают на карту сразу.',
    },
    {
      question: 'Что значит срочный займ?',
      answer: 'Срочный займ — это микрозайм с ускоренным процессом оформления. Заявка рассматривается автоматически, без проверки документов и долгих согласований.',
    },
    {
      question: 'Нужно ли подтверждение дохода?',
      answer: 'Нет, для срочных займов справка о доходах не требуется. Достаточно паспорта и банковской карты.',
    },
    {
      question: 'Можно ли получить займ ночью?',
      answer: 'Да, многие МФО работают круглосуточно. Ночью заявка также будет рассмотрена быстро, но перевод может занять чуть больше времени — до 15-30 минут.',
    },
    {
      question: 'Какой максимальный срок займа?',
      answer: 'Срок зависит от МФО и суммы. Обычно от 5 до 30 дней. При необходимости можно продлить займ (пролонгация).',
    },
  ];

  const contentBefore = (
    <section className="bg-gradient-to-b from-red-50 to-background dark:from-red-950/20 border-b">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-600">Экспресс решение</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Срочные займы — деньги за 5 минут
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-6">
          Получите деньги мгновенно. Экспресс-одобрение за 5-10 минут, 
          деньги на карту поступают сразу. Без справок, поручителей и лишних вопросов.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            <Zap className="h-4 w-4" />
            За 5 минут
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            <CheckCircle className="h-4 w-4" />
            95% одобрение
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
            <Clock className="h-4 w-4" />
            Круглосуточно
          </span>
        </div>
      </div>
    </section>
  );

  const contentAfter = (
    <section className="py-8 border-t bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Как получить срочный займ?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Срочные займы — это самый быстрый способ получить деньги. 
            Автоматическая система рассматривает заявку за 5-15 минут.
          </p>
          <ol className="mt-4 space-y-2">
            <li><strong>Выберите МФО</strong> — из списка организаций с быстрым одобрением</li>
            <li><strong>Заполните заявку</strong> — укажите сумму, срок и данные паспорта</li>
            <li><strong>Дождитесь решения</strong> — обычно за 5-10 минут придёт ответ</li>
            <li><strong>Получите деньги</strong> — на карту, сразу после одобрения</li>
          </ol>
          <p className="mt-4">
            <strong>Совет:</strong> для максимально быстрого получения денег выбирайте МФО 
            с временем решения 5 минут и мгновенным переводом на карту.
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
          title="Срочные займы"
          description="Деньги за 5 минут с моментальным одобрением"
          keywords={['срочные займы', 'займ за 5 минут', 'мгновенный займ', 'быстрый займ']}
          h1="Срочные займы — деньги за 5 минут"
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
