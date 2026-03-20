'use client';

import * as React from 'react';

interface JsonLdProductProps {
  /** Название продукта/МФО */
  name: string;
  /** Описание */
  description: string;
  /** URL изображения */
  image?: string;
  /** Минимальная цена (ставка) */
  minPrice?: number;
  /** Максимальная цена */
  maxPrice?: number;
  /** Рейтинг */
  rating?: number;
  /** Количество отзывов */
  reviewCount?: number;
  /** URL оффера */
  url?: string;
  /** ID оффера */
  productId?: string;
  /** Категория */
  category?: string;
  /** Бренд */
  brand?: string;
}

/**
 * Генерирует Product Schema.org JSON-LD
 * Минимальный вес — только необходимые поля
 */
export function generateProductSchema(data: JsonLdProductProps): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
  };

  // Обязательные поля
  if (data.name) schema.name = data.name;
  if (data.description) schema.description = data.description;

  // Изображение
  if (data.image) {
    schema.image = data.image;
  }

  // Цена (для займов используем процентную ставку как Offer)
  if (data.minPrice !== undefined || data.maxPrice !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      availability: 'https://schema.org/InStock',
    };
  }

  // Рейтинг (AggregateRating)
  if (data.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      reviewCount: data.reviewCount || 1,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Идентификатор
  if (data.productId) {
    schema.productID = data.productId;
  }

  // Категория
  if (data.category) {
    schema.category = data.category;
  }

  // Бренд
  if (data.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: data.brand,
    };
  }

  return schema;
}

/**
 * React-компонент для Product Schema
 */
export function ProductSchemaJsonLd({ ...props }: JsonLdProductProps) {
  const schema = generateProductSchema(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// FAQ Schema
// ============================================

export interface FaqItem {
  question: string;
  answer: string;
}

interface JsonLdFaqProps {
  items: FaqItem[];
}

/**
 * Генерирует FAQPage Schema.org JSON-LD
 */
export function generateFaqSchema(items: FaqItem[]): object {
  if (!items || items.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * React-компонент для FAQ Schema
 */
export function FaqSchemaJsonLd({ items }: JsonLdFaqProps) {
  const schema = generateFaqSchema(items);

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ============================================
// Website Schema (для главной страницы)
// ============================================

interface JsonLdWebsiteProps {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
}

/**
 * Генерирует WebSite Schema с SearchAction
 */
export function generateWebsiteSchema(data: JsonLdWebsiteProps): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    description: data.description,
    potentialAction: data.searchUrl
      ? {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${data.searchUrl}{search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        }
      : undefined,
  };
}

// ============================================
// Organization Schema
// ============================================

interface JsonLdOrganizationProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

/**
 * Генерирует Organization Schema
 */
export function generateOrganizationSchema(data: JsonLdOrganizationProps): object {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
  };

  if (data.logo) schema.logo = data.logo;
  if (data.description) schema.description = data.description;
  if (data.contactEmail) schema.email = data.contactEmail;
  if (data.contactPhone) schema.telephone = data.contactPhone;
  
  if (data.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...data.address,
    };
  }

  return schema;
}

// ============================================
// Комбинированный SEO Schema для страницы займов
// ============================================

export interface LoanPageSchema {
  /** Основной оффер для Product Schema */
  offer?: JsonLdProductProps;
  /** FAQ для страницы */
  faq?: FaqItem[];
  /** Website Schema */
  website?: JsonLdWebsiteProps;
}

/**
 * Генерирует все схемы для страницы займов
 * Объединяет Product + FAQ + Website в один компонент
 */
export function generateLoanPageSchemas(data: LoanPageSchema): object[] {
  const schemas: object[] = [];

  if (data.offer) {
    schemas.push(generateProductSchema(data.offer));
  }

  if (data.faq && data.faq.length > 0) {
    schemas.push(generateFaqSchema(data.faq));
  }

  if (data.website) {
    schemas.push(generateWebsiteSchema(data.website));
  }

  return schemas;
}

/**
 * Компонент для рендеринга всех схем страницы
 */
export function LoanPageJsonLd(data: LoanPageSchema) {
  const schemas = generateLoanPageSchemas(data);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
