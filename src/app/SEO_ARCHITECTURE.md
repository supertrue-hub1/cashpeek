# SEO URL Architecture

## Структура URL

| Тип страницы | Паттерн | Пример | Priority |
|-------------|---------|--------|----------|
| **Главная** | `/` | `/` | 1.0 |
| **Все займы** | `/zaimy` | `/zaimy` | 0.95 |
| **Категория** | `/zaimy/[category]` | `/zaimy/na-kartu` | 0.9 |
| **Город** | `/zaimy/v-[city]` | `/zaimy/v-moskva` | 0.85 |
| **Категория+Город** | `/zaimy/[category]/v-[city]` | `/zaimy/na-kartu/v-moskva` | 0.8 |
| **Сумма** | `/zaimy/do-[amount]-rublei` | `/zaimy/do-10000-rublei` | 0.7 |
| **МФО каталог** | `/mfo` | `/mfo` | 0.9 |
| **МФО карточка** | `/mfo/[slug]` | `/mfo/zaimer` | 0.85 |
| **МФО отзывы** | `/mfo/[slug]/otzyvy` | `/mfo/zaimer/otzyvy` | 0.6 |
| **МФО заявка** | `/mfo/[slug]/zayavka` | `/mfo/zaimer/zayavka` | 0.6 |
| **Блог** | `/blog` | `/blog` | 0.8 |
| **Блог статья** | `/blog/[slug]` | `/blog/kak-vybrat-zaim` | 0.6 |
| **Сравнение** | `/sravnit` | `/sravnit` | 0.8 |
| **О нас** | `/info/o-nas` | `/info/o-nas` | 0.7 |
| **Контакты** | `/info/kontakty` | `/info/kontakty` | 0.7 |
| **Сотрудничество** | `/info/sotrudnichestvo` | `/info/sotrudnichestvo` | 0.6 |
| **Privacy** | `/docs/privacy` | `/docs/privacy` | 0.3 |
| **Terms** | `/docs/terms` | `/docs/terms` | 0.3 |
| **Offerta** | `/docs/offerta` | `/docs/offerta` | 0.3 |

## Файловая структура `app/`

```
src/app/
├── page.tsx                          # /
│
├── zaimy/
│   ├── page.tsx                      # /zaimy
│   ├── [category]/
│   │   ├── page.tsx                  # /zaimy/na-kartu
│   │   └── v-[city]/
│   │       └── page.tsx              # /zaimy/na-kartu/v-moskva
│   └── v-[city]/
│       └── page.tsx                  # /zaimy/v-moskva
│
├── mfo/
│   ├── page.tsx                      # /mfo
│   └── [slug]/
│       ├── page.tsx                  # /mfo/zaimer
│       ├── otzyvy/
│       │   └── page.tsx              # /mfo/zaimer/otzyvy
│       └── zayavka/
│           └── page.tsx              # /mfo/zaimer/zayavka
│
├── blog/
│   ├── page.tsx                      # /blog
│   ├── [category]/
│   │   └── page.tsx                  # /blog/kredity
│   └── [slug]/
│       └── page.tsx                  # /blog/kak-vybrat-zaim
│
├── sravnit/
│   └── page.tsx                      # /sravnit
│
├── info/                             # Инфо-страницы
│   ├── o-nas/
│   │   └── page.tsx                  # /info/o-nas
│   ├── kontakty/
│   │   └── page.tsx                  # /info/kontakty
│   └── sotrudnichestvo/
│       └── page.tsx                  # /info/sotrudnichestvo
│
└── docs/                             # Юридические
    ├── privacy/
    │   └── page.tsx                  # /docs/privacy
    ├── terms/
    │   └── page.tsx                  # /docs/terms
    └── offerta/
        └── page.tsx                  # /docs/offerta
```

## Правила именования

- **Только lowercase**: ✅ `na-kartu`, ❌ `Na-Kartu`
- **Только латиница**: ✅ `zaimy`, ❌ `займы`
- **Разделитель — дефис**: ✅ `bez-otkaza`, ❌ `bez_otkaza`
- **Без ID в URL**: ✅ `mfo/zaimer`, ❌ `mfo/123`
- **Человекочитаемые**: ✅ `v-moskva` = "в Москве"

## Canonical URLs

Канонические URL генерируются автоматически через:
- `src/lib/seo/metadata.ts` — для категорий, городов, сумм, МФО
- `src/lib/seo/canonical.ts` — утилиты для канонизации

### Правила канонизации

1. `/zaimy/na-kartu?sort=rating` → `/zaimy/na-kartu`
2. `/zaimy/na-kartu/v-moskva?page=2` → `/zaimy/na-kartu/v-moskva`
3. `/mfo/zaimer?ref=sidebar` → `/mfo/zaimer`

## Silo-архитектура

```
                    ┌─────────────┐
                    │   / (Главная)│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │  /zaimy     │   │   /mfo      │   │   /blog     │
  │  (Silo 1)   │   │  (Silo 2)   │   │  (Silo 3)   │
  └─────────────┘   └─────────────┘   └─────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
   Категории           МФО карточки       Статьи
   + Города            + Отзывы
                       + Заявки
```

## Генерация Sitemap

Sitemap генерируется в `src/app/sitemap.ts` и включает:
- Главные страницы (daily)
- Категории займов (weekly)
- Города (weekly)
- Категория + Город комбинации (weekly)
- МФО (weekly)
- Блог (monthly)
- Info страницы (monthly)
- Legal страницы (yearly)

## Мета-теги

Каждая страница должна иметь:
- `title` — уникальный заголовок
- `description` — уникальное описание
- `alternates.canonical` — канонический URL
- `openGraph` — для соцсетей
- `keywords` — для релевантности (использовать умеренно)

## Переменные окружения

```env
NEXT_PUBLIC_SITE_URL=https://cashpeek.ru
```

Используется для генерации абсолютных URL в canonical и sitemap.
