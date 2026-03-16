'use client';

import type { ProductSchemaData } from '@/lib/seo/schemas/product';
import { createFinancialProductSchema } from '@/lib/seo/schemas/product';

interface ProductSchemaProps {
  data: ProductSchemaData;
}

/**
 * React-компонент для Product/FinancialProduct JSON-LD
 * Используется на страницах МФО
 */
export function ProductSchema({ data }: ProductSchemaProps) {
  if (!data) {
    return null;
  }

  const schema = createFinancialProductSchema(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface MfoPageSchemaProps {
  data: ProductSchemaData;
  faqItems?: { question: string; answer: string }[];
}

/**
 * Полная схема для страницы МФО (Product + FAQ)
 */
export function MfoPageSchema({ data, faqItems }: MfoPageSchemaProps) {
  if (!data) {
    return null;
  }

  const schemas: object[] = [];

  // FinancialProduct schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `Займ ${data.name}`,
    description: `Онлайн займ от ${data.name}. Сумма до ${data.maxAmount.toLocaleString('ru-RU')} ₽, ставка от ${data.firstLoanRate ?? data.baseRate}% в день.`,
    url: `https://cashpeek.ru/mfo/${data.slug}`,
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
    },
    aggregateRating: data.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  });

  // FAQ schema (если есть)
  if (faqItems && faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
