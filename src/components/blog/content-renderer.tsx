'use client';

import { useMemo } from 'react';
import { ContextualFAQ, type FAQItem } from '@/components/blog/contextual-faq';

interface ContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Парсит HTML контент и извлекает FAQ блоки
 */
function parseContentWithFAQs(content: string): {
  segments: Array<{ type: 'html' | 'faq'; content: string; faqs?: FAQItem[] }>;
  allFAQs: FAQItem[];
} {
  const segments: Array<{ type: 'html' | 'faq'; content: string; faqs?: FAQItem[] }> = [];
  const allFAQs: FAQItem[] = [];
  
  const commentPattern = /<!--\s*FAQ:\s*(\[[\s\S]*?\])\s*-->/gi;
  const faqBlockPattern = /<faq-block[^>]*question="([^"]*)"[^>]*answer="([^"]*)"[^>]*>\s*<\/faq-block>/gi;
  const divFaqPattern = /<div[^>]*data-faq="true"[^>]*data-question="([^"]*)"[^>]*data-answer="([^"]*)"[^>]*>\s*<\/div>/gi;
  
  const matches: Array<{ index: number; length: number; faqs: FAQItem[] }> = [];
  
  let match;
  
  while ((match = commentPattern.exec(content)) !== null) {
    try {
      const faqData = JSON.parse(match[1]);
      if (Array.isArray(faqData) && faqData.length > 0) {
        matches.push({
          index: match.index,
          length: match[0].length,
          faqs: faqData.map(f => ({
            question: f.question || f.q,
            answer: f.answer || f.a,
          })),
        });
        allFAQs.push(...faqData.map((f: any) => ({
          question: f.question || f.q,
          answer: f.answer || f.a,
        })));
      }
    } catch (e) {
      console.error('Failed to parse FAQ JSON:', e);
    }
  }
  
  while ((match = faqBlockPattern.exec(content)) !== null) {
    const faq: FAQItem = {
      question: decodeHTMLEntities(match[1]),
      answer: decodeHTMLEntities(match[2]),
    };
    matches.push({
      index: match.index,
      length: match[0].length,
      faqs: [faq],
    });
    allFAQs.push(faq);
  }
  
  while ((match = divFaqPattern.exec(content)) !== null) {
    const faq: FAQItem = {
      question: decodeHTMLEntities(match[1]),
      answer: decodeHTMLEntities(match[2]),
    };
    matches.push({
      index: match.index,
      length: match[0].length,
      faqs: [faq],
    });
    allFAQs.push(faq);
  }
  
  matches.sort((a, b) => a.index - b.index);
  
  let lastIndex = 0;
  
  matches.forEach((m) => {
    if (m.index > lastIndex) {
      segments.push({
        type: 'html',
        content: content.slice(lastIndex, m.index),
      });
    }
    
    segments.push({
      type: 'faq',
      content: '',
      faqs: m.faqs,
    });
    
    lastIndex = m.index + m.length;
  });
  
  if (lastIndex < content.length) {
    segments.push({
      type: 'html',
      content: content.slice(lastIndex),
    });
  }
  
  return { segments, allFAQs };
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
  };
  
  return text.replace(/&[^;]+;/g, (entity) => entities[entity] || entity);
}

/**
 * Рендерит контент статьи с поддержкой встроенных FAQ блоков
 */
export function ContentRenderer({ content, className }: ContentRendererProps) {
  const { segments } = useMemo(() => parseContentWithFAQs(content), [content]);
  
  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'html') {
          return (
            <div
              key={index}
              className="prose-segment"
              dangerouslySetInnerHTML={{ __html: segment.content }}
            />
          );
        }
        
        if (segment.type === 'faq' && segment.faqs) {
          return (
            <ContextualFAQ
              key={index}
              items={segment.faqs}
              title="Часто задаваемые вопросы"
              variant="default"
            />
          );
        }
        
        return null;
      })}
    </div>
  );
}

/**
 * Серверная функция для извлечения всех FAQ из контента
 */
export function extractAllFAQs(content: string): FAQItem[] {
  const { allFAQs } = parseContentWithFAQs(content);
  return allFAQs;
}
