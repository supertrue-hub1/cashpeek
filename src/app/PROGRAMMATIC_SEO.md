# Programmatic SEO Архитектура

## Обзор

Система Programmatic SEO для агрегатора МФО с поддержкой 500,000+ страниц.

---

## Структура URL

| Паттерн | Пример | Описание |
|---------|--------|----------|
| `/zaimy/[category]` | `/zaimy/na-kartu` | Категория займов |
| `/zaimy/v-[city]` | `/zaimy/v-moskva` | Город (все займы) |
| `/zaimy/[category]/v-[city]` | `/zaimy/na-kartu/v-moskva` | Категория + Город |

---

## Схема БД (Prisma)

### Модели:

1. **SeoCity** — города России
   - id, name, slug, preposition, genitive, population, region
   - isActive, priority

2. **SeoLoanType** — типы займов
   - id, name, slug, namePrepositional, description, keywords, h1
   - categorySlug (ссылка на LOAN_CATEGORIES)

3. **SeoPage** — SEO-страницы
   - cityId, loanTypeId, amount, term
   - pageTitle, pageDescription, h1
   - urlPath (уникальный)
   - isIndexable, noIndex, priority
   - contentHash, variationSeed

4. **SeoFaq** — FAQ для страниц
   - question, answer, loanTypeId, cityId

---

## Компоненты UI

### 1. SeoPageHeader
- H1, description, breadcrumb
- Статистика (кол-во предложений)

### 2. OfferList
- Список офферов
- Сортировка по интенту страницы:
  - `bez-procentov` → сначала 0%
  - `bez-otkaza` → по approvalRate
  - `na-kartu` → сначала с card

### 3. CityStats
- Детерминированная псевдо-статистика
- Популярные суммы/сроки
- Seed от citySlug

### 4. RelatedLinks
- Перелинковка: другие типы в том же городе
- Перелинковка: тот же тип в других городах

### 5. FaqBlock
- FAQ по типу займа
- Вариативные вопросы по городу

---

## Anti-Thin Content

### Стратегия:
1. **Динамическая сортировка офферов** под интент
2. **Псевдо-статистика** (детерминированная, но уникальная)
3. **Перелинковка** — связанные страницы
4. **FAQ** — уникальный контент

### Реализация:
- Seed от slug → детерминированные значения
- Разные сортировки для разных типов страниц
- Вариативные SEO-тексты

---

## Anti-Orphan Pages

### Перелинковка:
- На каждой странице: связанные типы в городе
- На каждой странице: тот же тип в других городах
- Breadcrumb на всех страницах
- Footer links

---

## Crawl Budget

### Стратегия:
1. **generateStaticParams** — только топ-50 страниц
2. **ISR** — revalidate = 3600 (1 час)
3. **dynamicParams = true** — остальные динамически

### Sitemap:
- Статические страницы (приоритет 1.0-0.9)
- Категории + города (150 страниц)
- SEO-страницы из БД (до 45,000)
- МФО, Блог

---

## Canonical / NoIndex

### Правила:
1. **Canonical** — основной URL без query params
2. **NoIndex** — для страниц с noIndex=true
3. **Robots.txt** — блокировка /api/, /admin/, ?utm_*

---

## Импорт данных

### Скрипт: `scripts/import-seo-pages.ts`

```bash
# Тестовый импорт (10k)
npx ts-node --compiler-options {"module":"CommonJS"} scripts/import-seo-pages.ts --test

# Полный импорт (CSV 210MB)
npx ts-node --compiler-options {"module":"CommonJS"} scripts/import-seo-pages.ts --full
```

### Особенности:
- Фильтрация строк с city="address"
- Bulk insert пачками по 500
- Маппинг типов займов → categorySlug

---

## Маппинг типов займов

```typescript
const LOAN_TYPE_MAPPING = {
  'Займы онлайн': 'onlain',
  'Микрозаймы': 'onlain',
  'Быстрые займы': 'onlain',
  'Займы до зарплаты': 'onlain',
  'Краткосрочные займы': 'onlain',
  'Долгосрочные займы': 'pod-zalog',
  'Займы без отказа': 'bez-otkaza',
  'Займы без проверки кредитной истории': 'bez-proverki-ki',
  'Займы на карту': 'na-kartu',
  'Займы наличными': 'na-kartu',
};
```

---

## Производительность

### Индексы БД:
- `@@index([cityId, loanTypeId])` — поиск страницы
- `@@index([urlPath])` — уникальный URL
- `@@index([isIndexable, noIndex])` — фильтрация
- `@@index([priority])` — сортировка

### Стратегия рендеринга:
- ISR с revalidate=3600
- generateStaticParams для топ-50
- Остальное — динамически

---

## Файлы

```
scripts/
└── import-seo-pages.ts      # Импорт из JSON/CSV

src/components/seo/
├── seo-page-header.tsx     # Заголовок страницы
├── offer-list.tsx          # Список офферов с сортировкой
├── stats-block.tsx         # Статистика города
├── related-links.tsx       # Перелинковка
└── faq-block.tsx           # FAQ

src/app/
├── zaimy/[category]/v-[city]/page.tsx  # SEO страница
├── sitemap.ts              # Sitemap с чанками
└── robots.ts               # Robots.txt
```
