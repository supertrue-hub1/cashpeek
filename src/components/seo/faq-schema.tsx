import type { FAQItem } from '@/contexts/page-faq-context';

export interface FAQSchemaProps {
  /**
   * Массив вопросов и ответов для Schema.org
   */
  items: FAQItem[];

  /**
   * Дополнительные CSS-классы (скрытый элемент)
   */
  className?: string;
}

/**
 * Генерирует JSON-LD Schema.org FAQPage
 *
 * Важно: Google предпочитает один JSON-LD блок со всеми вопросами,
 * а не несколько отдельных блоков.
 */
export function FAQSchema({ items, className }: FAQSchemaProps) {
  if (!items || items.length === 0) {
    return null;
  }

  // Очищаем HTML-теги из ответов для Schema (Google предпочитает plain text)
  const cleanText = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, '') // Удаляем HTML-теги
      .replace(/\s+/g, ' ') // Нормализуем пробелы
      .trim();
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: cleanText(item.answer),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      className={className}
    />
  );
}

/**
 * Серверная функция для создания Schema из переданных данных
 * Используется в серверных компонентах страниц
 */
export function createFAQSchema(items: FAQItem[]): object | null {
  if (!items || items.length === 0) {
    return null;
  }

  const cleanText = (html: string): string => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: cleanText(item.answer),
      },
    })),
  };
}

export default FAQSchema;
