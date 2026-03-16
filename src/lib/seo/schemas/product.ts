/**
 * Product и Offer Schema.org generators
 * https://schema.org/Product
 * https://schema.org/Offer
 */

export interface ProductSchemaData {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  rating: number;
  reviewCount?: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate?: number;
  affiliateUrl: string;
  features?: string[];
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

/**
 * Создаёт Product schema для МФО
 */
export function createProductSchema(data: ProductSchemaData): object {
  const url = `${BASE_URL}/mfo/${data.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Займ в ${data.name}`,
    description: data.description || 
      `Онлайн займ от ${data.name}. Сумма от ${data.minAmount.toLocaleString('ru-RU')} до ${data.maxAmount.toLocaleString('ru-RU')} ₽ на срок от ${data.minTerm} до ${data.maxTerm} дней.`,
    image: data.logo || undefined,
    url,
    brand: {
      '@type': 'Brand',
      name: data.name,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: data.reviewCount || Math.floor(data.rating * 100),
    },
    offers: {
      '@type': 'Offer',
      price: data.minAmount,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url,
      seller: {
        '@type': 'Organization',
        name: data.name,
      },
      eligibleRegion: {
        '@type': 'Country',
        name: 'Russia',
      },
    },
  };
}

/**
 * Создаёт Offer schema для займа
 */
export function createOfferSchema(data: ProductSchemaData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: `Займ ${data.name}`,
    description: `Микрозайм от ${data.name}. Ставка от ${data.firstLoanRate ?? data.baseRate}% в день.`,
    price: data.minAmount,
    priceCurrency: 'RUB',
    availability: 'https://schema.org/InStock',
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    url: `${BASE_URL}/mfo/${data.slug}`,
    seller: {
      '@type': 'Organization',
      name: data.name,
    },
    eligibleRegion: {
      '@type': 'Country',
      name: 'Russia',
    },
    priceSpecification: {
      '@type': 'PriceSpecification',
      price: data.baseRate,
      priceCurrency: 'RUB',
      valueAddedTaxIncluded: false,
    },
  };
}

/**
 * Создаёт FinancialProduct schema (более точная для МФО)
 */
export function createFinancialProductSchema(data: ProductSchemaData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `Займ ${data.name}`,
    description: data.description || 
      `Онлайн займ от ${data.name}. Сумма до ${data.maxAmount.toLocaleString('ru-RU')} ₽, ставка от ${data.firstLoanRate ?? data.baseRate}% в день.`,
    url: `${BASE_URL}/mfo/${data.slug}`,
    brand: {
      '@type': 'Brand',
      name: data.name,
    },
    offers: {
      '@type': 'LoanOrCredit',
      name: `Микрозайм ${data.name}`,
      amount: {
        '@type': 'MonetaryAmount',
        minValue: data.minAmount,
        maxValue: data.maxAmount,
        currency: 'RUB',
      },
      loanTerm: {
        '@type': 'QuantitativeValue',
        minValue: data.minTerm,
        maxValue: data.maxTerm,
        unitText: 'DAY',
      },
      interestRate: {
        '@type': 'QuantitativeValue',
        value: data.baseRate,
        unitText: 'PERCENT',
      },
      annualPercentageRate: {
        '@type': 'QuantitativeValue',
        value: data.baseRate * 365,
        unitText: 'PERCENT',
      },
    },
    aggregateRating: data.rating ? {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };
}

/**
 * Создаёт полную схему для страницы МФО (комбинация Product + FAQ)
 */
export function createMfoPageSchema(
  data: ProductSchemaData,
  faqItems?: { question: string; answer: string }[]
): object {
  const schemas = [
    createFinancialProductSchema(data),
  ];

  if (faqItems && faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}
