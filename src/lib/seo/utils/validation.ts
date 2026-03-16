/**
 * SEO Validation Utilities
 * Инструменты для проверки Schema.org разметки
 */

/**
 * Генерирует ссылку на Google Rich Results Test
 */
export function getRichResultsTestUrl(pageUrl: string): string {
  const encodedUrl = encodeURIComponent(pageUrl);
  return `https://search.google.com/test/rich-results?url=${encodedUrl}`;
}

/**
 * Генерирует ссылку на Schema.org валидатор
 */
export function getSchemaValidatorUrl(schemaJson: object): string {
  const encodedSchema = encodeURIComponent(JSON.stringify(schemaJson));
  return `https://validator.schema.org/#url=${encodedSchema}`;
}

/**
 * Проверяет обязательные поля в schema
 */
export function validateSchema(schema: object, requiredFields: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    const value = getNestedValue(schema, field);
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

function getNestedValue(obj: object, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Обязательные поля для Product schema
 */
export const REQUIRED_PRODUCT_FIELDS = [
  '@type',
  'name',
  'offers.price',
  'offers.priceCurrency',
];

/**
 * Обязательные поля для FAQPage schema
 */
export const REQUIRED_FAQ_FIELDS = [
  '@type',
  'mainEntity',
];

/**
 * Обязательные поля для BreadcrumbList schema
 */
export const REQUIRED_BREADCRUMB_FIELDS = [
  '@type',
  'itemListElement',
];

/**
 * Логирует результат валидации (для dev режима)
 */
export function logSchemaValidation(
  schemaType: string,
  schema: object,
  requiredFields: string[]
): void {
  if (process.env.NODE_ENV === 'development') {
    const result = validateSchema(schema, requiredFields);
    if (!result.valid) {
      console.warn(
        `[Schema Validation] ${schemaType} missing fields:`,
        result.missing
      );
    } else {
      console.log(`[Schema Validation] ${schemaType} is valid ✓`);
    }
  }
}
