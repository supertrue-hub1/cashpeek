'use client';

import type { BreadcrumbItem } from '@/lib/seo/schemas/breadcrumb';

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * React-компонент для BreadcrumbList JSON-LD
 * Рендерит <script type="application/ld+json"> в документ
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
