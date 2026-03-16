import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import {
  HeroCalculator,
  TopOffers,
  OffersSkeleton,
  ComparisonTable,
  EditorialContent,
  FaqSection,
  RelatedLinks,
  TrustDisclaimer,
} from '@/components/seo-hub';
import { getHubPageData } from '@/lib/seo-hub/get-hub-data';
import { BreadcrumbSchema, FAQSchema, OfferListSchema } from '@/components/seo/json-ld';
import { LOAN_CATEGORIES, CITIES } from '@/lib/seo/slugs';

// Disable static generation - use dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================
// Generate Metadata
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; city: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, city: citySlugWithPrefix } = await params;
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
  
  // Убираем префикс 'v-' если есть
  const citySlug = citySlugWithPrefix.startsWith('v-') 
    ? citySlugWithPrefix.slice(2) 
    : citySlugWithPrefix;
  
  const category = LOAN_CATEGORIES[categorySlug as keyof typeof LOAN_CATEGORIES];
  const city = CITIES[citySlug as keyof typeof CITIES];
  
  if (!category || !city) {
    return { title: 'Страница не найдена' };
  }
  
  const title = `${category.name} ${city.preposition} — сравнить ${category.shortDesc.toLowerCase()}`;
  const description = `${category.description} ${category.shortDesc} ${city.preposition}. Сравните ${category.namePrepositional} от ${city.genitive}.`;
  
  return {
    title,
    description,
    keywords: [...category.keywords, city.name, `займ ${city.preposition}`],
    alternates: {
      canonical: `${BASE_URL}/zaimy/${categorySlug}/v-${citySlug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/zaimy/${categorySlug}/v-${citySlug}`,
      locale: 'ru_RU',
      siteName: 'CashPeek',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ============================================
// Page Component
// ============================================

export default async function HubPage({
  params,
}: {
  params: Promise<{ category: string; city: string }>;
}) {
  const { category: categorySlug, city: citySlug } = await params;
  
  // Проверяем, что city начинается с 'v-'
  const actualCitySlug = citySlug.startsWith('v-') ? citySlug.slice(2) : citySlug;
  
  // Получаем данные
  let data;
  try {
    data = await getHubPageData(categorySlug, actualCitySlug);
  } catch (error) {
    console.error('Error in getHubPageData:', error);
    notFound();
  }
  
  if (!data) {
    notFound();
  }
  
  // Деструктуризация с дефолтными значениями
  const category = data.category;
  const city = data.city;
  const offers = Array.isArray(data.offers) ? data.offers : [];
  const offersCount = offers.length;
  const isFallback = data.isFallback ?? false;
  const faqs = Array.isArray(data.faqs) ? data.faqs : [];
  const relatedCities = Array.isArray(data.relatedCities) ? data.relatedCities : [];
  const relatedCategories = Array.isArray(data.relatedCategories) ? data.relatedCategories : [];
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* JSON-LD Schemas */}
      <BreadcrumbSchema
        items={[
          { name: 'Главная', url: 'https://cashpeek.ru' },
          { name: 'Займы', url: 'https://cashpeek.ru/zaimy' },
          { name: category.name, url: `https://cashpeek.ru/zaimy/${categorySlug}` },
          { name: city.name, url: `https://cashpeek.ru/zaimy/${categorySlug}/v-${actualCitySlug}` },
        ]}
      />
      {faqs.length > 0 && <FAQSchema faqs={faqs} />}
      
      <Header />
      
      <main className="flex-1">
        {/* Block 1: Hero + Calculator */}
        <HeroCalculator
          category={category}
          city={city}
          offersCount={offersCount}
        />
        
        {/* Block 2: Top Offers (20 шт) */}
        <section className="py-8 lg:py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TopOffers
              offers={offers}
              isFallback={isFallback}
              cityName={city.name}
            />
          </div>
        </section>
        
        {/* Block 3: Comparison Table */}
        <ComparisonTable
          offers={offers}
          cityName={city.name}
        />
        
        {/* Block 4: Editorial Content */}
        <EditorialContent
          category={category}
          city={city}
        />
        
        {/* Block 5: FAQ */}
        <FaqSection
          faqs={faqs}
          categoryName={category.name}
          cityName={city.name}
        />
        
        {/* Block 6: Related Links */}
        <RelatedLinks
          relatedCities={relatedCities}
          relatedCategories={relatedCategories}
          currentCity={city.name}
          currentCategory={category.name}
        />
        
        {/* Block 7: Trust/Disclaimer */}
        <TrustDisclaimer />
      </main>
      
      <Footer />
    </div>
  );
}
