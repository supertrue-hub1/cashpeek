/**
 * SEO Schema.org generators
 * Экспорт всех функций для генерации JSON-LD
 */

export { createBreadcrumbSchema, type BreadcrumbItem } from './breadcrumb';
export { createFAQSchema, type FAQItem } from './faq';
export { createProductSchema, createOfferSchema, type ProductSchemaData } from './product';
export { createOrganizationSchema, type OrganizationSchemaData } from './organization';
export { createAggregateRatingSchema, type AggregateRatingData } from './aggregate-rating';
export { createLocalBusinessSchema, type LocalBusinessData } from './local-business';

/**
 * Комбинирует несколько схем в один JSON-LD блок
 */
export function combineSchemas(...schemas: (object | null)[]): object | null {
  const validSchemas = schemas.filter(Boolean);
  
  if (validSchemas.length === 0) return null;
  if (validSchemas.length === 1) return validSchemas[0];
  
  return {
    '@context': 'https://schema.org',
    '@graph': validSchemas,
  };
}
