/**
 * FAQ блок для SEO-страниц
 * Anti-Thin Content: уникальный контент на каждой странице
 */

'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlockProps {
  loanTypeSlug?: string;
  cityName?: string;
}

// База вопросов по типам займов
const FAQ_BY_TYPE: Record<string, FaqItem[]> = {
  'na-kartu': [
    {
      question: 'Как получить займ на карту?',
      answer: 'Выберите МФО из списка, заполните заявку на сайте, укажите данные карты. Деньги зачисляются мгновенно на любую банковскую карту Visa, MasterCard или Мир.',
    },
    {
      question: 'Какая карта нужна для займа?',
      answer: 'Подходит любая дебетовая или кредитная карта российского банка. Карта должна быть именной, активной и иметь достаточно средств для подтверждения личности (обычно 1-10 рублей).',
    },
    {
      question: 'Сколько времени занимает перевод?',
      answer: 'Большинство МФО переводят деньги мгновенно, в течение 1-5 минут. В редких случаях перевод может занять до 15 минут.',
    },
  ],
  'bez-otkaza': [
    {
      question: 'Что значит "займ без отказа"?',
      answer: 'Это займы с высокой вероятностью одобрения (85-97%). МФО минимизируют проверки и принимают решение автоматически на основе базовых критериев.',
    },
    {
      question: 'Кому дают займы без отказа?',
      answer: 'Займы без отказа доступны гражданам РФ от 18-21 года с постоянной регистрацией. Требования минимальны: паспорт и телефон.',
    },
    {
      question: 'Гарантированно ли одобрение?',
      answer: 'Ни одна МФО не даёт 100% гарантии, но процент одобрения в этих компаниях значительно выше среднего.',
    },
  ],
  'bez-proverki-ki': [
    {
      question: 'Дадут ли займ с плохой кредитной историей?',
      answer: 'Да, многие МФО выдают займы без проверки кредитной истории. Решение принимается на основе других данных заёмщика.',
    },
    {
      question: 'Как влияет плохая КИ на условия займа?',
      answer: 'При плохой КИ могут быть повышенные требования к возрасту, доходу или предложены меньшие суммы на первый займ.',
    },
    {
      question: 'Можно ли улучшить кредитную историю займами?',
      answer: 'Да, своевременное погашение микрозаймов положительно влияет на вашу кредитную историю в БКИ.',
    },
  ],
  'bez-procentov': [
    {
      question: 'Реально ли беспроцентный займ?',
      answer: 'Да, многие МФО предлагают первый займ под 0% для новых клиентов. Это маркетинговая акция для привлечения заёмщиков.',
    },
    {
      question: 'Какие условия беспроцентного займа?',
      answer: 'Обычно это небольшие суммы (до 15 000 ₽) на короткий срок (до 15 дней). При своевременном погашении вы платите только сумму займа.',
    },
    {
      question: 'Как получить беспроцентный займ?',
      answer: 'Выберите МФО с акцией "первый займ под 0%", зарегистрируйтесь как новый клиент и оформите заявку.',
    },
  ],
  'default': [
    {
      question: 'Как выбрать лучший займ?',
      answer: 'Обратите внимание на процентную ставку, срок займа, сумму и отзывы о МФО. Используйте наш сервис для сравнения предложений.',
    },
    {
      question: 'Какие документы нужны для займа?',
      answer: 'Обычно достаточно паспорта РФ. Некоторые МФО могут запросить дополнительные документы: СНИЛС, ИНН или водительское удостоверение.',
    },
    {
      question: 'Как погасить займ?',
      answer: 'Способы погашения: банковской картой на сайте МФО, через банкомат, в салонах связи или переводом по реквизитам.',
    },
  ],
};

// Дополнительные вопросы по городам
const FAQ_BY_CITY: Record<string, FaqItem[]> = {
  'default': [],
};

// Генерация FAQ на основе параметров
function getFaqItems(loanTypeSlug?: string, cityName?: string): FaqItem[] {
  const baseFaq = loanTypeSlug && FAQ_BY_TYPE[loanTypeSlug] 
    ? FAQ_BY_TYPE[loanTypeSlug] 
    : FAQ_BY_TYPE['default'];
  
  // Добавляем вариативность в зависимости от города
  let cityFaq: FaqItem[] = [];
  if (cityName) {
    cityFaq = [
      {
        question: `Есть ли займы в ${cityName}?`,
        answer: `Да, в ${cityName} доступны займы от всех крупных МФО России. Вы можете оформить заявку дистанционно, деньги поступят на вашу карту.`,
      },
    ];
  }
  
  return [...cityFaq, ...baseFaq];
}

export function FaqBlock({ loanTypeSlug, cityName }: FaqBlockProps) {
  const faqItems = getFaqItems(loanTypeSlug, cityName);
  
  if (faqItems.length === 0) return null;
  
  return (
    <section className="py-8 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Частые вопросы
        </h2>
        
        <Accordion type="single" collapsible className="space-y-2">
          {faqItems.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-muted rounded-xl px-4 border-0"
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
    </section>
  );
}
