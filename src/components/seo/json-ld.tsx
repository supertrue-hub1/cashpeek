/**
 * Comprehensive JSON-LD Schema Components
 * Все необходимые схемы для SEO-оптимизации
 */

import { BASE_URL, SITE_INFO } from '@/lib/seo/metadata-utils';

// ============================================
// Types
// ============================================

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface OfferSchema {
  name: string;
  slug: string;
  description?: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  rating?: number;
  logo?: string;
}

interface LocalBusinessParams {
  cityName: string;
  citySlug: string;
  offersCount: number;
  population?: number;
}

interface LocalBusinessSchemaProps {
  params: LocalBusinessParams;
}

interface ArticleSchemaProps {
  title: string;
  description?: string;
  image?: string;
  datePublished?: string | Date;
  dateModified?: string | Date;
  author?: {
    name: string;
    url?: string;
  };
  url?: string;
}

interface SeoPageSchemasProps {
  breadcrumbs: BreadcrumbItem[];
  faqs?: FAQItem[];
  offers?: OfferSchema[];
  cityName?: string;
  citySlug?: string;
  pageTitle: string;
  population?: number;
}

// ============================================
// JSON-LD Script Component (безопасный рендеринг)
// ============================================

function escapeJsonLd(json: string): string {
  return json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

function JsonLdScript({ schema }: { schema: object }) {
  const jsonString = JSON.stringify(schema);
  const escaped = escapeJsonLd(jsonString);
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escaped }}
    />
  );
}

// ============================================
// Organization Schema
// ============================================

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_INFO.name,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Сервис сравнения микрофинансовых организаций',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: SITE_INFO.email,
      availableLanguage: ['Russian'],
    },
    sameAs: [],
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// WebSite Schema (для поиска)
// ============================================

export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_INFO.name,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// BreadcrumbList Schema
// ============================================

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const safeItems = items || [];
  
  if (safeItems.length === 0) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: safeItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// FAQPage Schema
// ============================================

export function FAQSchema({ items }: FAQSchemaProps) {
  const safeItems = items || [];
  
  if (safeItems.length === 0) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: safeItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// Product Schema (для оффера МФО)
// ============================================

export function ProductSchema({ offer }: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: offer.name,
    description: offer.description || `${offer.name} — займ от ${offer.minAmount} до ${offer.maxAmount} ₽`,
    url: `${BASE_URL}/mfo/${offer.slug}`,
    provider: {
      '@type': 'Organization',
      name: offer.name,
      image: offer.logo,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice: offer.minAmount,
      highPrice: offer.maxAmount,
      offerCount: 1,
    },
    ...(offer.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: offer.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: 100,
      },
    }),
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// ItemList Schema (для списка офферов)
// ============================================

export function OfferListSchema({ title, listName, description, offers, url }: OfferListSchemaProps) {
  const safeOffers = offers || [];
  
  if (safeOffers.length === 0) return null;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName || title || 'Список предложений',
    description,
    url: url || BASE_URL,
    numberOfItems: safeOffers.length,
    itemListElement: safeOffers.map((offer, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'FinancialProduct',
        name: offer.name,
        description: offer.description || `${offer.name} — займ от ${offer.minAmount} до ${offer.maxAmount} ₽`,
        url: `${BASE_URL}/mfo/${offer.slug}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'RUB',
          price: offer.minAmount,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// LocalBusiness Schema (для городских страниц)
// ============================================

export function LocalBusinessSchema({ params }: LocalBusinessSchemaProps) {
  const { cityName, citySlug, offersCount, population } = params;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Займы в ${cityName}`,
    description: `Сравнение ${offersCount} МФО в ${cityName}. Онлайн займы на карту.`,
    url: `${BASE_URL}/zaimy/v-${citySlug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressCountry: 'RU',
    },
    ...(population && {
      areaServed: {
        '@type': 'City',
        name: cityName,
        population: population.toString(),
      },
    }),
    priceRange: '₽₽',
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// Article Schema (для блога)
// ============================================

export function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished: datePublished ? new Date(datePublished).toISOString() : undefined,
    dateModified: dateModified ? new Date(dateModified).toISOString() : undefined,
    url: url ? `${BASE_URL}${url}` : undefined,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          url: author.url,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_INFO.name,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
  };

  return <JsonLdScript schema={schema} />;
}

// ============================================
// Combined Schema для SEO-страниц
// ============================================

export function SeoPageSchemas({
  breadcrumbs,
  faqs,
  offers,
  cityName,
  citySlug,
  pageTitle,
  population,
}: SeoPageSchemasProps) {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      {faqs && faqs.length > 0 && <FAQSchema items={faqs} />}
      {offers && offers.length > 0 && (
        <OfferListSchema title={pageTitle} offers={offers} />
      )}
      {cityName && citySlug && (
        <LocalBusinessSchema
          params={{ cityName, citySlug, offersCount: offers?.length || 0, population }}
        />
      )}
    </>
  );
}

// ============================================
// Export all
// ============================================

export const JsonLd = {
  Organization: OrganizationSchema,
  WebSite: WebSiteSchema,
  Breadcrumb: BreadcrumbSchema,
  FAQ: FAQSchema,
  Product: ProductSchema,
  OfferList: OfferListSchema,
  LocalBusiness: LocalBusinessSchema,
  Article: ArticleSchema,
  SeoPage: SeoPageSchemas,
};
