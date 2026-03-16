# Contextual FAQ Blocks — Руководство по использованию

## Обзор

Система **Contextual FAQ Blocks** позволяет вставлять FAQ-блоки непосредственно в контент статьи с автоматической генерацией SEO-оптимизированной Schema.org разметки.

## Ключевые особенности

- ✅ **SEO-оптимизация**: Все FAQ собираются в один JSON-LD блок
- ✅ **Reusable**: Компонент можно переиспользовать в разных частях статьи
- ✅ **Клиентская интерактивность**: Accordion с плавной анимацией
- ✅ **Мобильная адаптация**: Удобное раскрытие на touch-устройствах
- ✅ **Поддержка HTML**: Возможность использовать разметку в ответах

---

## Быстрый старт

### 1. Базовое использование

```tsx
import { ContextualFAQ } from '@/components/blog/contextual-faq';

const faqItems = [
  {
    question: 'Как проверить МФО в реестре ЦБ?',
    answer: 'Зайдите на сайт ЦБ РФ и найдите раздел "Реестр МФО".',
  },
  {
    question: 'Какие документы нужны для займа?',
    answer: 'Обычно достаточно <strong>паспорта РФ</strong>.',
  },
];

<ContextualFAQ items={faqItems} />
```

### 2. С заголовком и описанием

```tsx
<ContextualFAQ
  items={faqItems}
  title="Часто задаваемые вопросы"
  description="Ответы на популярные вопросы о займах"
/>
```

### 3. Варианты стилизации

```tsx
// Серый фон (по умолчанию)
<ContextualFAQ items={faqItems} variant="default" />

// С рамкой
<ContextualFAQ items={faqItems} variant="bordered" />

// Минимальный стиль
<ContextualFAQ items={faqItems} variant="minimal" />
```

---

## Интеграция в статью

### Вариант 1: Статические данные (рекомендуется для SEO)

```tsx
// app/blog/[slug]/page.tsx
import { ContextualFAQ } from '@/components/blog/contextual-faq';
import { FAQSchema } from '@/components/seo/faq-schema';
import { PageFAQProvider } from '@/contexts/page-faq-context';

// Данные статьи (из CMS или файла)
const articleData = {
  title: 'Как выбрать МФО',
  sections: [
    { type: 'text', content: 'Вступительный текст...' },
    { type: 'faq', items: [/* FAQ items */] },
    { type: 'text', content: 'Продолжение статьи...' },
    { type: 'faq', items: [/* Ещё FAQ items */] },
  ],
};

// Извлекаем все FAQ для Schema
const allFAQs = articleData.sections
  .filter(s => s.type === 'faq')
  .flatMap(s => s.items);

export default function BlogPostPage() {
  return (
    <>
      {/* JSON-LD Schema - рендерится один раз */}
      <FAQSchema items={allFAQs} />

      <PageFAQProvider initialFAQs={allFAQs}>
        <article>
          {articleData.sections.map((section, i) => {
            if (section.type === 'faq') {
              return <ContextualFAQ key={i} items={section.items} />;
            }
            // ... рендер других типов секций
          })}
        </article>
      </PageFAQProvider>
    </>
  );
}
```

### Вариант 2: Использование с MDX

```mdx
---
title: Как выбрать МФО
---

import { FAQ } from '@/components/blog/mdx-faq';

Выбор МФО — важный шаг. Давайте разберёмся в деталях.

<FAQ
  items={[
    { q: "Что такое МФО?", a: "Микрофинансовая организация — компания, выдающая займы." },
    { q: "Как проверить лицензию?", a: "На сайте ЦБ РФ в реестре МФО." }
  ]}
/>

## Подробнее о процентах

Текст о процентных ставках...

<FAQ
  title="Вопросы о ставках"
  items={[
    { q: "Какая максимальная ставка?", a: "Не более 0.8% в день по закону." }
  ]}
/>
```

---

## API Reference

### ContextualFAQ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FAQItem[]` | **required** | Массив вопросов и ответов |
| `title` | `string` | - | Заголовок блока |
| `description` | `string` | - | Описание под заголовком |
| `variant` | `'default' \| 'bordered' \| 'minimal'` | `'default'` | Вариант стилизации |
| `type` | `'single' \| 'multiple'` | `'single'` | Тип аккордеона |
| `defaultExpanded` | `string` | - | ID открытого по умолчанию элемента |
| `className` | `string` | - | Дополнительные CSS-классы |

### FAQItem Type

```typescript
interface FAQItem {
  question: string;
  answer: string; // Поддерживает HTML-разметку
}
```

### FAQSchema Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FAQItem[]` | **required** | Массив вопросов и ответов |

---

## SEO Best Practices

### ✅ Правильно

```tsx
// Один JSON-LD блок со всеми вопросами
<FAQSchema items={allFAQsFromArticle} />
```

### ❌ Неправильно

```tsx
// Множественные JSON-LD блоки (Google не рекомендует)
{faqBlocks.map(faq => <FAQSchema items={faq.items} />)}
```

### Рекомендации

1. **Количество вопросов**: 3-8 вопросов на статью (оптимально для SEO)
2. **Длина ответа**: 40-200 символов для snippet
3. **HTML в ответах**: Допустимо, но для Schema текст очищается автоматически
4. **Уникальность**: Вопросы должны быть уникальны на уровне страницы

---

## Архитектура

```
src/
├── contexts/
│   └── page-faq-context.tsx    # Контекст для сбора FAQ
├── components/
│   ├── blog/
│   │   └── contextual-faq.tsx  # UI-компонент
│   └── seo/
│       └── faq-schema.tsx      # JSON-LD генератор
├── lib/
│   └── blog/
│       └── faq-utils.ts        # Утилиты для работы с FAQ
└── types/
    └── blog.ts                 # TypeScript типы
```

---

## Пример полного интегрированного решения

См. файл `src/app/blog/[slug]/page.tsx` для полного примера реализации.
