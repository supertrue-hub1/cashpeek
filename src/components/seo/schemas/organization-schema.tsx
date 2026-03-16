'use client';

import { createOrganizationSchema, createWebSiteSchema } from '@/lib/seo/schemas/organization';
import type { OrganizationSchemaData } from '@/lib/seo/schemas/organization';

interface OrganizationSchemaProps {
  data?: Partial<OrganizationSchemaData>;
}

/**
 * React-компонент для Organization JSON-LD
 * Используется на главной странице
 */
export function OrganizationSchema({ data }: OrganizationSchemaProps) {
  const schema = createOrganizationSchema(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * React-компонент для WebSite JSON-LD
 * Используется на главной странице для поиска
 */
export function WebSiteSchema() {
  const schema = createWebSiteSchema();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Комбинированная схема для главной страницы
 */
export function HomePageSchema() {
  const orgSchema = createOrganizationSchema();
  const webSchema = createWebSiteSchema();

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [orgSchema, webSchema],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
