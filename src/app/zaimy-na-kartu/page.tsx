 import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { SEOLoanPage } from '@/components/seo-loan-page';
import { CreditCard, CheckCircle, Zap, Clock } from 'lucide-react';
import type { Offer } from '@/types/offer';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Займы на карту мгновенно — круглосуточно без отказа | Онлайн за 5 минут',
  description: 'Займы на банковскую карту онлайн. Мгновенное зачисление, одобрение за 5 минут. Работаем круглосуточно. Visa, MasterCard, Мир. Без справок и поручителей.',
  keywords: 'займы на карту, займ на банковскую карту, мгновенный займ на карту, займ онлайн на карту, займ на карту без отказа',
  alternates: {
    canonical: '/zaimy-na-kartu',
  },
  openGraph: {
    title: 'Займы на карту мгновенно — круглосуточно без отказа',
    description: 'Получите займ на любую банковскую карту. Мгновенное зачисление, одобрение за 5 минут.',
    url: '/zaimy-na-kartu',
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

export default async function CardLoansPage() {
  const allOffers = await getOffers();

  // Filter: payout to card (on server)
  const offers = allOffers.filter(offer => 
    Array.isArray(offer.payoutMethods) && offer.payoutMethods.includes('card')
  );

  const features = [
    {
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      title: 'Любая карта',
      description: 'Visa, MasterCard, Мир — деньги поступают на карту любого банка РФ.',
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      title: 'Мгновенное зачисление',
      description: 'Деньги поступают на карту сразу после одобрения, обычно за 1-5 минут.',
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-600" />,
      title: 'Круглосуточно',
      description: 'Оформите заявку в любое время — днём, вечером или ночью.',
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'Без визита в офис',
      description: 'Всё онлайн — от заявки до получения денег. Не нужно никуда ходить.',
    },
  ];

  const faq = [
    {
      question: 'На какую карту можно получить займ?',
      answer: 'Займ можно получить на любую банковскую карту Visa, MasterCard или Мир, выпущенную российскими банками. Карта должна быть именной и принадлежать заёмщику.',
    },
    {
      question: 'Как быстро придут деньги на карту?',
      answer: 'Деньги поступают на карту мгновенно после одобрения заявки. В редких случаях перевод может занять до 15 минут — это зависит от вашего банка.',
    },
    {
      question: 'Можно ли получить займ на чужую карту?',
      answer: 'Нет, зачисление возможно только на карту, принадлежащую заёмщику. При оформлении карта верифицируется на ваше имя.',
    },
    {
      question: 'Нужна ли карта Сбербанка?',
      answer: 'Нет, подойдёт карта любого российского банка — Сбербанка, Тинькофф, ВТБ, Альфа-Банка и других. Главное, чтобы карта была именной.',
    },
    {
      question: 'Как погасить займ?',
      answer: 'Погашение также происходит с банковской карты через личный кабинет МФО. Можно погасить досрочно — проценты пересчитаются.',
    },
  ];

  const contentBefore = (
    <section className="bg-gradient-to-b from-orange-50 to-background dark:from-orange-950/20 border-b">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-orange-600">Мгновенное зачисление</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Займы на карту мгновенно — круглосуточно без отказа
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-6">
          Получите деньги на банковскую карту за 5-15 минут. 
          Работаем круглосуточно, без справок и поручителей. 
          Visa, MasterCard, Мир — любая карта российского банка.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
            <CreditCard className="h-4 w-4" />
            Visa, MasterCard, Мир
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
            <Zap className="h-4 w-4" />
            Мгновенно
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            <Clock className="h-4 w-4" />
            24/7
          </span>
        </div>
      </div>
    </section>
  );

  const contentAfter = (
    <section className="py-8 border-t bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Как получить займ на карту?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Оформление займа на карту занимает всего 5-10 минут. 
            Весь процесс происходит онлайн, без визита в офис.
          </p>
          <ol className="mt-4 space-y-2">
            <li><strong>Подготовьте карту</strong> — любая именная карта Visa, MasterCard или Мир</li>
            <li><strong>Оформите заявку</strong> — заполните анкету на сайте выбранной МФО</li>
            <li><strong>Привяжите карту</strong> — карта верифицируется автоматически</li>
            <li><strong>Получите деньги</strong> — средства поступят на карту за 1-5 минут</li>
          </ol>
          <p className="mt-4">
            После получения займа вы можете погасить его досрочно с этой же карты. 
            При досрочном погашении проценты пересчитываются.
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
          title="Займы на карту"
          description="Мгновенное зачисление на любую карту"
          keywords={['займы на карту', 'займ на банковскую карту', 'мгновенный займ на карту']}
          h1="Займы на карту мгновенно — круглосуточно без отказа"
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
