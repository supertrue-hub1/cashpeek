import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { SeoPageContent } from '@/components/seo/SeoPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { SeoText } from '@/components/seo/seo-text';
import { generateSeoMetadata, generateAlternates, generateCanonicalUrl } from '@/lib/seo/advanced-metadata';
import { declineCity, declineLoanType } from '@/lib/seo/declensions';

// ISR: разрешает динамические параметры
export const dynamicParams = true;

// Регенерация страниц каждые 24 часа
export const revalidate = 86400;

// Предгенерация топ-100 страниц с высоким приоритетом
export async function generateStaticParams() {
  try {
    const topPages = await db.seoCombination.findMany({
      where: {
        isIndexable: true,
        noIndex: false,
        status: 'published',
        priority: { gte: 8 }, // Только высокоприоритетные
      },
      select: {
        loanTypeSlug: true,
        citySlug: true,
        amountValue: true,
        termSlug: true,
      },
      orderBy: [
        { priority: 'desc' },
        { viewsCount: 'desc' },
      ],
      take: 100, // Топ-100 для предгенерации
    });

    console.log(`[SEO] Generating ${topPages.length} static pages...`);

    return topPages.map((page) => ({
      type: page.loanTypeSlug,
      city: page.citySlug,
      amount: `${page.amountValue}-rubley`,
      term: page.termSlug,
    }));
  } catch (error) {
    console.error('[SEO] Error in generateStaticParams:', error);
    return [];
  }
}

// Генерация метаданных с годом и CTA
export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; city: string; amount: string; term: string }>;
}): Promise<Metadata> {
  const { type, city, amount, term } = await params;

  // Получаем данные страницы
  const page = await db.seoCombination.findFirst({
    where: {
      citySlug: city,
      loanTypeSlug: type,
      isIndexable: true,
      noIndex: false,
    },
    select: {
      pageTitle: true,
      pageDescription: true,
      city: true,
      loanType: true,
      amountValue: true,
    },
  });

  if (!page) {
    return {
      title: 'Страница не найдена',
    };
  }

  // Парсим сумму из URL
  const amountValue = parseInt(amount.replace('-rubley', ''), 10) || page.amountValue || 50000;

  // Генерируем расширенные мета-теги с годом и CTA
  const seoMeta = generateSeoMetadata({
    loanType: page.loanType,
    city: page.city,
    amount: amountValue,
  });

  // Канонический URL
  const path = `/${type}/${city}`;
  const canonical = generateCanonicalUrl(path);
  const alternates = generateAlternates(path);

  return {
    title: seoMeta.title,
    description: seoMeta.description,
    openGraph: {
      title: seoMeta.ogTitle,
      description: seoMeta.ogDescription,
      type: 'website',
      locale: 'ru_RU',
      url: canonical,
    },
    alternates,
    other: {
      'robots': 'index, follow',
    },
  };
}

// Основной компонент страницы
export default async function SeoDynamicPage({
  params,
}: {
  params: Promise<{ type: string; city: string; amount: string; term: string }>;
}) {
  const { type, city, amount, term } = await params;

  // Получаем данные страницы
  const pageData = await db.seoCombination.findFirst({
    where: {
      citySlug: city,
      loanTypeSlug: type,
      status: 'published',
    },
    select: {
      id: true,
      city: true,
      citySlug: true,
      loanType: true,
      loanTypeSlug: true,
      pageTitle: true,
      pageDescription: true,
      amount: true,
      amountValue: true,
      term: true,
      termSlug: true,
      priority: true,
      variationSeed: true,
    },
  });

  if (!pageData) {
    notFound();
  }

  // Склоняем названия для Breadcrumbs
  const cityDeclined = declineCity(pageData.city);
  const typeDeclined = declineLoanType(pageData.loanType);

  // URL для Breadcrumbs
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
  const breadcrumbItems = [
    { name: 'Главная', href: baseUrl },
    { name: 'Займы', href: `${baseUrl}/zaimy` },
    { name: typeDeclined.nominative, href: `${baseUrl}/zaimy/${type}` },
    { name: `в ${cityDeclined.prepositional}`, href: `${baseUrl}/zaimy/${type}/v-${city}` },
  ];

  // Получаем офферы для этой страницы
  const offers = await getRelevantOffers(pageData.amountValue);

  // Получаем соседние типы займов для перелинковки
  const relatedTypes = await getRelatedTypes(city, type);

  // Получаем соседние города для перелинковки
  const relatedCities = await getRelatedCities(city, type);

  // Обновляем счётчик просмотров (асинхронно, не блокируя)
  incrementViews(pageData.id).catch(console.error);

  return (
    <>
      {/* JSON-LD микроразметка */}
      <JsonLd
        type="LoanCollection"
        data={{
          name: pageData.pageTitle,
          description: pageData.pageDescription,
          city: pageData.city,
          loanType: pageData.loanType,
          amount: pageData.amountValue,
        }}
      />

      {/* Breadcrumbs с Schema.org */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs 
          items={breadcrumbItems} 
          enableSchema={true}
        />
      </div>

      <SeoPageContent
        pageData={pageData}
        offers={offers}
        relatedTypes={relatedTypes}
        relatedCities={relatedCities}
      />

      {/* SEO-текст со склонениями */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <SeoText
          loanType={pageData.loanType}
          city={pageData.city}
        />
      </div>
    </>
  );
}

// Получение релевантных офферов
async function getRelevantOffers(amount: number) {
  const minAmount = Math.max(0, amount - 10000);
  const maxAmount = amount + 50000;

  return db.loanOffer.findMany({
    where: {
      status: 'published',
      minAmount: { lte: maxAmount },
      maxAmount: { gte: minAmount },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      rating: true,
      minAmount: true,
      maxAmount: true,
      minTerm: true,
      maxTerm: true,
      baseRate: true,
      firstLoanRate: true,
      decisionTime: true,
      approvalRate: true,
      isFeatured: true,
      isNew: true,
      affiliateUrl: true,
    },
    orderBy: [
      { isFeatured: 'desc' },
      { rating: 'desc' },
    ],
    take: 10,
  });
}

// Получение соседних типов займов
async function getRelatedTypes(citySlug: string, currentType: string) {
  return db.seoCombination.findMany({
    where: {
      citySlug,
      loanTypeSlug: { not: currentType },
      isIndexable: true,
      noIndex: false,
    },
    select: {
      loanType: true,
      loanTypeSlug: true,
      city: true,
      citySlug: true,
    },
    distinct: ['loanTypeSlug'],
    take: 6,
  });
}

// Получение соседних городов
async function getRelatedCities(currentCity: string, typeSlug: string) {
  return db.seoCombination.findMany({
    where: {
      citySlug: { not: currentCity },
      loanTypeSlug: typeSlug,
      isIndexable: true,
      noIndex: false,
    },
    select: {
      city: true,
      citySlug: true,
      loanType: true,
      loanTypeSlug: true,
    },
    distinct: ['citySlug'],
    take: 6,
  });
}

// Инкремент счётчика просмотров
async function incrementViews(pageId: string) {
  await db.seoCombination.update({
    where: { id: pageId },
    data: { viewsCount: { increment: 1 } },
  });
}
