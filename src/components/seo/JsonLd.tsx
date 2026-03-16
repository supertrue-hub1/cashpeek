/**
 * JsonLd - Компонент для JSON-LD микроразметки
 * 
 * Поддерживает различные типы схем: Product, FAQ, BreadcrumbList, LoanCollection
 */

interface JsonLdProps {
  type: 'Product' | 'FAQ' | 'BreadcrumbList' | 'LoanCollection' | 'Organization';
  data: Record<string, unknown>;
}

export function JsonLd({ type, data }: JsonLdProps) {
  const schema = generateSchema(type, data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Генерация схемы по типу
 */
function generateSchema(type: JsonLdProps['type'], data: Record<string, unknown>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

  switch (type) {
    case 'LoanCollection':
      return generateLoanCollectionSchema(data, baseUrl);
    
    case 'Product':
      return generateProductSchema(data, baseUrl);
    
    case 'FAQ':
      return generateFAQSchema(data);
    
    case 'BreadcrumbList':
      return generateBreadcrumbSchema(data);
    
    case 'Organization':
      return generateOrganizationSchema(baseUrl);
    
    default:
      return {};
  }
}

/**
 * Схема для коллекции займов
 */
function generateLoanCollectionSchema(
  data: Record<string, unknown>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.name,
    description: data.description,
    url: `${baseUrl}/${data.loanTypeSlug}/${data.citySlug}`,
    numberOfItems: data.numberOfItems || 10,
    itemListElement: (data.offers as Array<Record<string, unknown>> || []).map((offer, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'FinancialProduct',
        name: offer.name,
        description: offer.description,
        provider: {
          '@type': 'Organization',
          name: offer.providerName,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'RUB',
          price: offer.minAmount,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
}

/**
 * Схема для продукта (конкретный займ)
 */
function generateProductSchema(
  data: Record<string, unknown>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: data.name,
    description: data.description,
    url: `${baseUrl}/mfo/${data.slug}`,
    provider: {
      '@type': 'Organization',
      name: data.providerName,
      image: data.logo,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      lowPrice: data.minAmount,
      highPrice: data.maxAmount,
      offerCount: 1,
    },
    aggregateRating: data.rating ? {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: data.ratingCount || 100,
    } : undefined,
  };
}

/**
 * Схема для FAQ
 */
function generateFAQSchema(data: Record<string, unknown>) {
  const questions = data.questions as Array<{ question: string; answer: string }> || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * Схема для хлебных крошек
 */
function generateBreadcrumbSchema(data: Record<string, unknown>) {
  const items = data.items as Array<{ name: string; url: string }> || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Схема для организации
 */
function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CashPeek',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Сервис сравнения микрофинансовых организаций',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@cashpeek.ru',
    },
    sameAs: [],
  };
}

/**
 * Комбинированный JSON-LD для SEO-страницы
 */
export function SeoPageJsonLd({
  pageTitle,
  pageDescription,
  city,
  loanType,
  amount,
  offers,
}: {
  pageTitle: string;
  pageDescription: string;
  city: string;
  loanType: string;
  amount: number;
  offers: Array<{
    name: string;
    minAmount: number;
    maxAmount: number;
    rating: number;
  }>;
}) {
  return (
    <>
      {/* ItemList Schema */}
      <JsonLd
        type="LoanCollection"
        data={{
          name: pageTitle,
          description: pageDescription,
          citySlug: city.toLowerCase().replace(/\s+/g, '-'),
          loanTypeSlug: loanType.toLowerCase().replace(/\s+/g, '-'),
          numberOfItems: offers.length,
          offers: offers.map((offer) => ({
            name: offer.name,
            description: `${offer.name} - ${offer.minAmount}-${offer.maxAmount} ₽`,
            providerName: offer.name,
            minAmount: offer.minAmount,
          })),
        }}
      />

      {/* BreadcrumbList Schema */}
      <JsonLd
        type="BreadcrumbList"
        data={{
          items: [
            { name: 'Главная', url: '/' },
            { name: 'Займы', url: '/zaimy' },
            { name: loanType, url: `/${loanType.toLowerCase().replace(/\s+/g, '-')}` },
            { name: city, url: `/${loanType.toLowerCase().replace(/\s+/g, '-')}/${city.toLowerCase().replace(/\s+/g, '-')}` },
          ],
        }}
      />
    </>
  );
}
