"use client";

import { ContextualFAQ } from './contextual-faq';
import type { FAQItem } from '@/contexts/page-faq-context';

export interface MDXFAQProps {
  /**
   * Массив вопросов и ответов (короткий формат для MDX)
   */
  items: Array<{
    q: string;  // question
    a: string;  // answer
  }>;

  /**
   * Заголовок блока
   */
  title?: string;

  /**
   * Вариант стилизации
   */
  variant?: 'default' | 'bordered' | 'minimal';
}

/**
 * MDX-совместимый компонент FAQ
 *
 * Использование в MDX:
 *
 * ```mdx
 * import { FAQ } from '@/components/blog/mdx-faq';
 *
 * <FAQ
 *   title="Частые вопросы"
 *   items={[
 *     { q: "Вопрос 1", a: "Ответ 1" },
 *     { q: "Вопрос 2", a: "Ответ 2 с <strong>HTML</strong>" }
 *   ]}
 * />
 * ```
 */
export function FAQ({ items, title, variant = 'default' }: MDXFAQProps) {
  // Преобразуем короткий формат в стандартный
  const faqItems: FAQItem[] = items.map((item) => ({
    question: item.q,
    answer: item.a,
  }));

  return (
    <ContextualFAQ
      items={faqItems}
      title={title}
      variant={variant}
    />
  );
}

export default FAQ;
