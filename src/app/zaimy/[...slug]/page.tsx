import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { LOAN_CATEGORIES, CITIES, AMOUNTS, type LoanCategorySlug, type CitySlug } from '@/lib/seo/slugs';
import { getCategoryConfig, generateFaqSchema } from '@/lib/category/category-config';
import { generateBreadcrumb } from '@/lib/seo/metadata';
import { createCategoryBreadcrumb, createCategoryCityBreadcrumb } from '@/lib/seo/schemas/breadcrumb';
import { createFAQSchema, createCategoryFAQSchema, createCityFAQSchema } from '@/lib/seo/schemas/faq';
import { createLocalBusinessSchema } from '@/lib/seo/schemas/local-business';
import { getCategoryTemplates, getCityTemplates } from '@/lib/seo/utils/text-templates';
import { generateCategoryKeywords, generateCityKeywords } from '@/lib/seo/utils/keywords';
import { generateStats, generateLoanTips, generateCityFacts } from '@/lib/seo/content';
import {
  CategoryHero,
  QuickScenarios,
  TopOffers,
  OffersComparisonTable,
  HowToChoose,
  WhoSuits,
  CategoryFaq,
  InternalLinks,
  TrustBlock,
} from '@/components/category';
import { SeoPageHeader } from '@/components/seo/seo-page-header';
import { OfferList } from '@/components/seo/offer-list';
import { CityStats } from '@/components/seo/stats-block';
import { SeoFooterLinks } from '@/components/seo/related-links';
import { FaqBlock } from '@/components/seo/faq-block';
import { generateRelatedCategoryLinks, generateRelatedCityLinks } from '@/lib/seo/interlinking';
import { ContextualLinks } from '@/components/seo/interlinking/contextual-links';
import { SeoTipsBlock, SeoFactsBlock } from '@/components/seo/blocks/seo-content-block';
// Smart Fallback imports
import { getSeoPageOffers, generateFallbackExplanation, generateFallbackMetadata } from '@/lib/seo/smart-fallback';
import { SmartFallbackComponent, EmptySearchFallback } from '@/components/seo/smart-fallback-component';

// ISR: обновление каждый час
export const revalidate = 3600;
export const dynamicParams = true;

// Парсинг slug для определения типа страницы
function parseSlug(slug: string[]) {
  // Варианты:
  // [category] -> /zaimy/bez-otkaza
  // [category, v-city] -> /zaimy/bez-otkaza/v-moskva
  // [do-amount-rublei] -> /zaimy/do-1000-rublei
  // [do-amount-rublei, v-city] -> /zaimy/do-1000-rublei/v-moskva
  // [v-city] -> /zaimy/v-moskva

  if (slug.length === 1) {
    const first = slug[0];
    
    // v-city -> город
    if (first.startsWith('v-')) {
      const citySlug = first.slice(2);
      return { type: 'city', citySlug };
    }
    
    // do-amount-rublei -> сумма
    if (first.startsWith('do-') && first.endsWith('-rublei')) {
      const amountSlug = first.slice(3, -7);
      return { type: 'amount', amountSlug };
    }
    
    // category
    return { type: 'category', categorySlug: first };
  }
  
  if (slug.length === 2) {
    const [first, second] = slug;
    
    // [category, v-city]
    if (second.startsWith('v-')) {
      const citySlug = second.slice(2);
      
      // [do-amount-rublei, v-city]
      if (first.startsWith('do-') && first.endsWith('-rublei')) {
        const amountSlug = first.slice(3, -7);
        return { type: 'amount-city', amountSlug, citySlug };
      }
      
      // [category, v-city]
      return { type: 'category-city', categorySlug: first, citySlug };
    }
  }
  
  return { type: 'unknown' };
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string[] }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  const BASE_URL = 'https://cashpeek.ru';
  
  if (parsed.type === 'category') {
    const config = getCategoryConfig(parsed.categorySlug);
    const category = LOAN_CATEGORIES[parsed.categorySlug as LoanCategorySlug];
    
    if (config) {
      return {
        title: config.title,
        description: config.description,
        keywords: config.keywords,
        alternates: {
          canonical: `${BASE_URL}/zaimy/${parsed.categorySlug}`,
        },
        openGraph: {
          title: config.title,
          description: config.description,
          type: 'website',
          url: `${BASE_URL}/zaimy/${parsed.categorySlug}`,
        },
      };
    }
    
    if (!category) return { title: 'Страница не найдена' };
    
    const templates = getCategoryTemplates(category.name, category.namePrepositional, category.shortDesc);
    
    return {
      title: templates.title,
      description: templates.description,
      keywords: generateCategoryKeywords(parsed.categorySlug),
      alternates: {
        canonical: `${BASE_URL}/zaimy/${parsed.categorySlug}`,
      },
    };
  }
  
  if (parsed.type === 'city') {
    const city = CITIES[parsed.citySlug as CitySlug];
    if (!city) return { title: 'Страница не найдена' };
    
    const templates = getCityTemplates(city.name, city.preposition, city.population);
    
    return {
      title: templates.title,
      description: templates.description,
      keywords: generateCityKeywords(city.name, city.preposition),
      alternates: {
        canonical: `${BASE_URL}/zaimy/v-${parsed.citySlug}`,
      },
    };
  }
  
  if (parsed.type === 'category-city') {
    const cat = LOAN_CATEGORIES[parsed.categorySlug as LoanCategorySlug];
    const city = CITIES[parsed.citySlug as CitySlug];
    if (!cat || !city) return { title: 'Страница не найдена' };
    
    const templates = getCategoryTemplates(cat.name, cat.namePrepositional, cat.shortDesc, city.name, city.preposition);
    
    return {
      title: templates.title,
      description: templates.description,
      keywords: generateCategoryKeywords(parsed.categorySlug, city.name),
      alternates: {
        canonical: `${BASE_URL}/zaimy/${parsed.categorySlug}/v-${parsed.citySlug}`,
      },
    };
  }
  
  if (parsed.type === 'amount') {
    const amount = AMOUNTS.find(a => a.slug === parsed.amountSlug);
    if (!amount) return { title: 'Страница не найдена' };
    
    // Проверяем, есть ли офферы для noindex
    const offersCount = await db.loanOffer.count({
      where: {
        status: 'published',
        minAmount: { lte: amount.value },
        maxAmount: { gte: amount.value },
      },
    });
    
    const isEmpty = offersCount === 0;
    
    return {
      title: `Займы ${amount.display} — быстрое одобрение онлайн${isEmpty ? ' (альтернативы)' : ''}`,
      description: `Займы ${amount.title}. Сравните условия от лучших МФО.${isEmpty ? ' Показаны альтернативные предложения.' : ''}`,
      alternates: {
        canonical: `${BASE_URL}/zaimy/do-${parsed.amountSlug}-rublei`,
      },
      robots: isEmpty ? { index: false, follow: true } : undefined,
    };
  }
  
  if (parsed.type === 'amount-city') {
    const amount = AMOUNTS.find(a => a.slug === parsed.amountSlug);
    const city = CITIES[parsed.citySlug as CitySlug];
    if (!amount || !city) return { title: 'Страница не найдена' };
    
    // Проверяем, есть ли офферы для noindex
    const offersCount = await db.loanOffer.count({
      where: {
        status: 'published',
        minAmount: { lte: amount.value },
        maxAmount: { gte: amount.value },
      },
    });
    
    const isEmpty = offersCount === 0;
    
    return {
      title: `Займы ${amount.display} ${city.preposition}${isEmpty ? ' — альтернативы' : ''}`,
      description: `Займы ${amount.title} ${city.preposition}. Быстрое одобрение.${isEmpty ? ' Показаны альтернативные предложения.' : ''}`,
      alternates: {
        canonical: `${BASE_URL}/zaimy/do-${parsed.amountSlug}-rublei/v-${parsed.citySlug}`,
      },
      robots: isEmpty ? { index: false, follow: true } : undefined,
    };
  }
  
  return { title: 'Страница не найдена' };
}

// Получение офферов с Smart Fallback
async function getOffersWithFallback(params: {
  type?: string;
  city?: string;
  amount?: number;
  term?: number;
}) {
  return getSeoPageOffers(params);
}

// Простой поиск офферов (без fallback)
async function getOffers() {
  try {
    return await db.loanOffer.findMany({
      where: { status: 'published' },
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      take: 20,
      include: {
        tags: { include: { tag: true } },
      },
    });
  } catch (e) {
    console.error('Failed to fetch offers:', e);
    return [];
  }
}
  
// Форматирование оффера для компонентов
function formatOffer(offer: Awaited<ReturnType<typeof db.loanOffer.findMany>>[0]): import('@/types/offer').Offer {
  // Безопасный парсинг JSON полей
  const parseJsonArray = (value: unknown): string[] => {
    if (!value) return ['passport'];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : ['passport'];
      } catch {
        return ['passport'];
      }
    }
    return ['passport'];
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
    features: offer.tags?.map((t) => {
      const slugToFeature: Record<string, import('@/types/offer').OfferFeature> = {
        'first-loan-zero': 'first_loan_zero',
        'no-overpayments': 'no_overpayments',
        'prolongation': 'prolongation',
        'early-repayment': 'early_repayment',
        'no-hidden-fees': 'no_hidden_fees',
        'online-approval': 'online_approval',
        'one-document': 'one_document',
        'loyalty-program': 'loyalty_program',
      };
      return slugToFeature[t.tag.slug];
    }).filter(Boolean) || ['online_approval'],
    payoutMethods: parseJsonArray(offer.payoutMethods) as import('@/types/offer').PayoutMethod[],
    badCreditOk: offer.badCreditOk ?? false,
    noCalls: offer.noCalls ?? false,
    roundTheClock: offer.roundTheClock ?? false,
    minAge: offer.minAge || 18,
    documents: parseJsonArray(offer.documents) as import('@/types/offer').DocumentRequirement[],
    editorNote: offer.editorNote || offer.customDescription || undefined,
    affiliateUrl: offer.affiliateUrl || '#',
    isFeatured: offer.isFeatured ?? false,
    isNew: offer.isNew ?? false,
    isPopular: offer.isPopular ?? false,
  };
}
  
export default async function DynamicSeoPage({ 
  params 
}: { 
  params: Promise<{ slug: string[] }> 
}) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  const rawOffers = await getOffers();
  
  // Форматируем офферы для компонентов
  const offers = rawOffers.map(formatOffer);
  
  // ============================================
  // КАТЕГОРИЯ (новый дизайн)
  // ============================================
  if (parsed.type === 'category') {
    const config = getCategoryConfig(parsed.categorySlug);
    
    // Если есть конфиг — используем новый дизайн
    if (config) {
      const topOffers = offers.slice(0, 3);
      
      const breadcrumb = [
        { name: 'Главная', url: 'https://cashpeek.ru/' },
        { name: 'Займы', url: 'https://cashpeek.ru/zaimy' },
        { name: config.name, url: `https://cashpeek.ru/zaimy/${parsed.categorySlug}` },
      ];
      
      const seoContent = `
        <p><strong>${config.name}</strong> — удобный способ получить деньги на банковскую карту без визита в офис и справок о доходах.</p>
        <h3>Как получить займ ${config.namePrepositional}?</h3>
        <p>Процесс оформления занимает 5–10 минут. Выберите предложение, заполните анкету на сайте МФО и получите деньги на карту.</p>
        <h3>Требования к заёмщику</h3>
        <ul>
          <li>Гражданство РФ</li>
          <li>Возраст от 18 до 75 лет</li>
          <li>Постоянная регистрация</li>
          <li>Паспорт и банковская карта</li>
        </ul>
      `;

      return (
        <div className="flex min-h-screen flex-col bg-background">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumb(breadcrumb)) }}
          />
          <Header />
          <main className="flex-1">
            <CategoryHero config={config} offersCount={offers.length} />
            <QuickScenarios scenarios={config.scenarios} />
            <TopOffers offers={topOffers} title="Рекомендуемые предложения" />
            <TrustBlock />
            <section id="offers" className="py-8 bg-background">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <h2 className="text-xl font-bold text-foreground mb-4">Все предложения</h2>
                <OffersComparisonTable offers={offers} />
              </div>
            </section>
            <HowToChoose steps={config.howToChoose} />
            <WhoSuits items={config.whoSuits} />
            <div
              className="prose prose-slate dark:prose-invert max-w-none container mx-auto px-4 sm:px-6 lg:px-8 py-10"
              dangerouslySetInnerHTML={{ __html: seoContent }}
            />
            <CategoryFaq items={config.faq} />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFaqSchema(config.faq)) }}
            />
            <InternalLinks currentCategory={parsed.categorySlug} />
          </main>
          <Footer />
        </div>
      );
    }
    
    // Fallback на старый дизайн
    const category = LOAN_CATEGORIES[parsed.categorySlug as LoanCategorySlug];
    if (!category) notFound();
    
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <SeoPageHeader
            h1={category.h1}
            description={category.description}
            loanTypeName={category.name}
            offersCount={offers.length}
          />
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <OfferList offers={rawOffers} showSort={true} />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }
  
  // ============================================
  // ГОРОД
  // ============================================
  if (parsed.type === 'city') {
    const city = CITIES[parsed.citySlug as CitySlug];
    if (!city) notFound();
    
    // Генерируем схемы
    const breadcrumbSchema = createCategoryBreadcrumb('zaimy', 'Займы');
    const faqSchema = createCityFAQSchema(city.name, city.preposition);
    const localBusinessSchema = createLocalBusinessSchema({
      cityName: city.name,
      citySlug: parsed.citySlug,
      population: city.population,
      offersCount: offers.length,
    });
    
    // Генерируем SEO-контент
    const stats = generateStats(offers.map(o => ({
      rating: o.rating,
      baseRate: o.baseRate,
      firstLoanRate: o.firstLoanRate,
      decisionTime: o.decisionTime,
      approvalRate: o.approvalRate,
    })));
    const tips = generateLoanTips();
    const facts = generateCityFacts(parsed.citySlug);
    const relatedLinks = generateRelatedCategoryLinks('', parsed.citySlug);
    
    const combinedSchema = {
      '@context': 'https://schema.org',
      '@graph': [breadcrumbSchema, faqSchema, localBusinessSchema],
    };
    
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
        />
        <Header />
        <main className="flex-1">
          <SeoPageHeader
            h1={`Займы ${city.preposition}`}
            description={`Лучшие займы ${city.preposition}. Быстрое одобрение за 5 минут.`}
            cityName={city.name}
            offersCount={offers.length}
          />
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <OfferList offers={rawOffers} showSort={true} />
            </div>
          </section>
          <SeoTipsBlock tips={tips} title={`Советы заёмщикам в ${city.name}`} className="py-8 bg-muted" />
          <SeoFactsBlock facts={facts} title={`Займы ${city.preposition} в цифрах`} className="py-8" />
          <ContextualLinks 
            links={relatedLinks} 
            title="Виды займов в вашем городе" 
            className="py-8 bg-muted" 
          />
          <SeoFooterLinks citySlug={parsed.citySlug} />
        </main>
        <Footer />
      </div>
    );
  }
  
  // ============================================
  // КАТЕГОРИЯ + ГОРОД
  // ============================================
  if (parsed.type === 'category-city') {
    const category = LOAN_CATEGORIES[parsed.categorySlug as LoanCategorySlug];
    const city = CITIES[parsed.citySlug as CitySlug];
    if (!category || !city) notFound();
    
    // Генерируем схемы
    const breadcrumbSchema = createCategoryCityBreadcrumb(
      parsed.categorySlug,
      category.name,
      parsed.citySlug,
      city.name,
      city.preposition
    );
    const faqSchema = createFAQSchema([
      {
        question: `Как получить ${category.namePrepositional} ${city.preposition}?`,
        answer: `Для получения ${category.namePrepositional} ${city.preposition} выберите подходящее предложение на нашем сайте, перейдите на сайт МФО и заполните онлайн-заявку. Деньги поступят на карту за 5-15 минут.`,
      },
      {
        question: `Работают ли МФО ${city.preposition} круглосуточно?`,
        answer: `Да, большинство МФО ${city.preposition} работают 24/7. Вы можете подать заявку в любое время дня и ночи.`,
      },
      {
        question: 'Нужна ли прописка в городе для получения займа?',
        answer: 'Нет, прописка в конкретном городе не требуется. Достаточно гражданства РФ и постоянной регистрации на территории России.',
      },
    ]);
    const localBusinessSchema = createLocalBusinessSchema({
      cityName: city.name,
      citySlug: parsed.citySlug,
      population: city.population,
      offersCount: offers.length,
    });
    
    // Генерируем SEO-контент
    const tips = generateLoanTips(parsed.categorySlug);
    const facts = generateCityFacts(parsed.citySlug);
    const relatedCategoryLinks = generateRelatedCategoryLinks(parsed.categorySlug, parsed.citySlug);
    const relatedCityLinks = generateRelatedCityLinks(parsed.citySlug, parsed.categorySlug);
    
    const combinedSchema = {
      '@context': 'https://schema.org',
      '@graph': [breadcrumbSchema, faqSchema, localBusinessSchema],
    };
    
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
        />
        <Header />
        <main className="flex-1">
          <SeoPageHeader
            h1={`${category.name} ${city.preposition}`}
            description={`${category.description} Доступно в ${city.name}.`}
            cityName={city.name}
            cityPreposition={city.preposition}
            loanTypeName={category.name}
            offersCount={offers.length}
          />
          <section className="py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <OfferList offers={rawOffers} loanTypeSlug={parsed.categorySlug} showSort={true} />
            </div>
          </section>
          <CityStats cityName={city.name} citySlug={parsed.citySlug} />
          <SeoTipsBlock tips={tips} title="Советы по оформлению" className="py-8 bg-muted" />
          <div className="grid md:grid-cols-2 gap-6 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
            <ContextualLinks 
              links={relatedCategoryLinks} 
              title="Другие виды займов" 
              columns={2}
            />
            <ContextualLinks 
              links={relatedCityLinks} 
              title="В соседних городах" 
              columns={2}
            />
          </div>
          <SeoFooterLinks citySlug={parsed.citySlug} loanTypeSlug={parsed.categorySlug} />
        </main>
        <Footer />
      </div>
    );
  }
  
  // ============================================
  // СУММА (с Smart Fallback)
  // ============================================
  if (parsed.type === 'amount') {
    const amount = AMOUNTS.find(a => a.slug === parsed.amountSlug);
    if (!amount) notFound();
    
    // Используем Smart Fallback для поиска офферов
    const fallbackResult = await getOffersWithFallback({
      amount: amount.value,
    });
    
    const rawOffers = fallbackResult.offers;
    const offers = rawOffers.map(formatOffer);
    
    // Генерируем объяснение для fallback
    const explanation = fallbackResult.isFallback 
      ? generateFallbackExplanation({
          amount: amount.value,
          offersCount: offers.length,
        })
      : undefined;
    
    // Генерируем метаданные для fallback
    const fallbackMeta = generateFallbackMetadata({
      amount: amount.value,
      isFallback: fallbackResult.isFallback,
      isEmpty: fallbackResult.isEmpty,
    });
    
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {fallbackMeta.noIndex && (
          <meta name="robots" content="noindex, follow" />
        )}
        <Header />
        <main className="flex-1">
          <SeoPageHeader
            h1={`Займы ${amount.display}${fallbackMeta.titleSuffix}`}
            description={`Подберите займ ${amount.title} от проверенных МФО.${fallbackMeta.descriptionSuffix}`}
            loanTypeName={`Займы ${amount.display}`}
            offersCount={offers.length}
          />
          
          {/* Smart Fallback Component */}
          <SmartFallbackComponent
            isFallback={fallbackResult.isFallback}
            isEmpty={fallbackResult.isEmpty}
            fallbackReason={fallbackResult.fallbackReason}
            searchParams={fallbackResult.searchParams}
            amount={amount.value}
            offersCount={offers.length}
            explanation={explanation}
          />
          
          {/* Empty State */}
          {fallbackResult.isEmpty && offers.length === 0 ? (
            <EmptySearchFallback amount={amount.value} />
          ) : (
            <section className="py-8">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <OfferList offers={rawOffers} showSort={true} />
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    );
  }
  
  // ============================================
  // СУММА + ГОРОД (с Smart Fallback)
  // ============================================
  if (parsed.type === 'amount-city') {
    const amount = AMOUNTS.find(a => a.slug === parsed.amountSlug);
    const city = CITIES[parsed.citySlug as CitySlug];
    if (!amount || !city) notFound();
    
    // Используем Smart Fallback для поиска офферов
    const fallbackResult = await getOffersWithFallback({
      city: parsed.citySlug,
      amount: amount.value,
    });
    
    const rawOffers = fallbackResult.offers;
    const offers = rawOffers.map(formatOffer);
    
    // Генерируем объяснение для fallback
    const explanation = fallbackResult.isFallback 
      ? generateFallbackExplanation({
          amount: amount.value,
          cityName: city.name,
          offersCount: offers.length,
        })
      : undefined;
    
    // Генерируем метаданные для fallback
    const fallbackMeta = generateFallbackMetadata({
      amount: amount.value,
      cityName: city.name,
      isFallback: fallbackResult.isFallback,
      isEmpty: fallbackResult.isEmpty,
    });
    
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {fallbackMeta.noIndex && (
          <meta name="robots" content="noindex, follow" />
        )}
        <Header />
        <main className="flex-1">
          <SeoPageHeader
            h1={`Займы ${amount.display} ${city.preposition}${fallbackMeta.titleSuffix}`}
            description={`Займы ${amount.title} ${city.preposition}. Быстрое одобрение.${fallbackMeta.descriptionSuffix}`}
            cityName={city.name}
            loanTypeName={`Займы ${amount.display}`}
            offersCount={offers.length}
          />
          
          {/* Smart Fallback Component */}
          <SmartFallbackComponent
            isFallback={fallbackResult.isFallback}
            isEmpty={fallbackResult.isEmpty}
            fallbackReason={fallbackResult.fallbackReason}
            searchParams={fallbackResult.searchParams}
            amount={amount.value}
            cityName={city.name}
            offersCount={offers.length}
            explanation={explanation}
          />
          
          {/* Empty State */}
          {fallbackResult.isEmpty && offers.length === 0 ? (
            <EmptySearchFallback amount={amount.value} cityName={city.name} />
          ) : (
            <section className="py-8">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <OfferList offers={rawOffers} showSort={true} />
              </div>
            </section>
          )}
          
          <CityStats cityName={city.name} citySlug={parsed.citySlug} />
          <FaqBlock cityName={city.name} />
          <SeoFooterLinks citySlug={parsed.citySlug} />
        </main>
        <Footer />
      </div>
    );
  }
  
  notFound();
}
