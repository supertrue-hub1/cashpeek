'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { FAQItem } from '@/types/offer';

interface FAQSectionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQSection({ items, className }: FAQSectionProps) {
  return (
    <section id="faq" className={cn('py-12 sm:py-16 bg-muted/30', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Часто задаваемые вопросы</h2>
            <p className="text-muted-foreground">Отвечаем на популярные вопросы о займах</p>
          </div>

          {/* FAQ accordion */}
          <Accordion type="single" collapsible className="w-full space-y-2">
            {items.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-2xl border border-border bg-card px-5 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
