import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import type { FaqItem } from '@/lib/seo-hub/types';

interface FaqSectionProps {
  faqs: FaqItem[];
  categoryName?: string;
  cityName?: string;
}

export function FaqSection({ faqs, categoryName, cityName }: FaqSectionProps) {
  // Защита от undefined
  const safeFaqs = faqs || [];
  
  if (safeFaqs.length === 0) {
    return null;
  }
  
  return (
    <section className="py-8 lg:py-12 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Часто задаваемые вопросы
            </h2>
            {categoryName && (
              <Badge variant="secondary" className="ml-2">
                {categoryName}
              </Badge>
            )}
          </div>
          
          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-3">
            {safeFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* Schema.org hint */}
          <p className="mt-6 text-sm text-muted-foreground text-center">
            Не нашли ответ на свой вопрос?{' '}
            <a href="/contacts" className="text-primary hover:underline">
              Свяжитесь с нами
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
