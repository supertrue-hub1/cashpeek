# Аудит сайта cashpeek.ru

**Дата:** 20 марта 2026  
**Версия:** 0.2.0

---

## 📊 Общая оценка: 8.5/10

| Категория | Оценка | Статус |
|-----------|--------|--------|
| SEO | 9/10 | ✅ Отлично |
| Производительность | 8/10 | ✅ Хорошо |
| Безопасность | 8/10 | ✅ Хорошо |
| Доступность | 8/10 | ✅ Хорошо |
| Контент | 9/10 | ✅ Отлично |
| Техническое SEO | 9/10 | ✅ Отлично |

---

## ✅ Что работает хорошо

### 1. SEO (9/10)

#### Robots.txt ✅
- Правильно настроен для всех ботов
- Закрыты служебные разделы (`/admin/`, `/api/`, `/cabinet/`)
- Указан Host и Sitemap
- Разрешена пагинация

#### Sitemap ✅
- Главный sitemap + 70+ дополнительных
- Покрытие: статические страницы, категории, города, МФО, блог, SEO-страницы
- Динамическая генерация

#### Мета-теги ✅
- Title с шаблоном `%s | CashPeek`
- Description уникальный для каждой страницы
- Open Graph и Twitter Cards
- Правильный `metadataBase`

#### Schema.org ✅
- OrganizationSchema
- WebSiteSchema
- BreadcrumbSchema
- ProductSchema (для офферов)
- FAQSchema

#### Структура URL ✅
- ЧПУ для всех страниц
- SEO-оптимизированные URL:
  - `/zaimy-na-kartu`
  - `/zaimy-bez-protsentov`
  - `/mfo/[slug]`
  - `/blog/[slug]`

### 2. Производительность (8/10)

#### Next.js оптимизации ✅
- `output: "standalone"` — минимальный размер
- `optimizePackageImports` — оптимизация импортов
- Image Optimization с AVIF/WebP
- Правильные `deviceSizes` и `imageSizes`

#### Кэширование ✅
- Статические ресурсы кэшируются
- Sitemap с Cache-Control
- API с `force-dynamic` где нужно

#### Шрифты ✅
- Google Fonts с `display: "swap"`
- Variable fonts для гибкости

### 3. Безопасность (8/10)

#### Headers ✅
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
X-DNS-Prefetch-Control: on
```

#### Редиректы ✅
- 301 редиректы для старых URL
- Защита от бесконечных циклов

### 4. Контент (9/10)

#### Страницы ✅
- 70+ страниц в sitemap
- SEO-страницы для городов и категорий
- Блог с категориями
- FAQ страница

#### Микроразметка ✅
- Schema.org для организации
- FAQ Schema для вопросов
- Product Schema для офферов

### 5. Аналитика ✅

- Google Analytics 4 (gtag.js)
- Яндекс.Метрика
- Отслеживание событий:
  - `click_mfo_button`
  - `view_offer_details`
  - `calculator_amount_change`
  - `calculator_term_change`

---

## ⚠️ Что требует внимания

### 1. Performance (критично)

#### Проблема: Большой размер страницы
- Много офферов на главной (29+)
- Много изображений

**Решение:**
- Добавить lazy loading для офферов
- Использовать virtualization для списков
- Оптимизировать изображения

### 2. Accessibility

#### Проблема: Не все изображения имеют alt
**Решение:** Проверить все `<img>` на наличие alt-атрибутов

### 3. SEO

#### Проблема: Нет canonical URL для SEO-страниц
**Решение:** Добавить `<link rel="canonical">` на все страницы

### 4. Безопасность

#### Проблема: Нет CSP (Content Security Policy)
**Решение:** Добавить CSP headers

---

## 🔧 Рекомендации

### Приоритет 1 (Критично)

1. **Добавить canonical URL**
```typescript
// В metadata каждой страницы
alternates: {
  canonical: `${BASE_URL}/path`,
}
```

2. **Оптимизировать изображения**
- Использовать Next.js Image везде
- Добавить placeholder="blur"

3. **Добавить CSP**
```typescript
// В next.config.ts headers
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://mc.yandex.ru; ..."
}
```

### Приоритет 2 (Важно)

1. **Добавить критические CSS**
- Inline critical CSS для первой загрузки

2. **Оптимизировать шрифты**
- Рассмотреть self-hosting шрифтов

3. **Добавить сервис-воркер**
- Для кэширования статических ресурсов

### Приоритет 3 (Желательно)

1. **Добавить RSS для блога**
2. **Добавить WebP/AVIF для всех изображений**
3. **Минифицировать HTML**

---

## 📈 Метрики для отслеживания

| Метрика | Цель | Текущее |
|---------|------|---------|
| LCP | < 2.5s | ~3s |
| FID | < 100ms | ~50ms |
| CLS | < 0.1 | ~0.05 |
| TTFB | < 600ms | ~400ms |
| Page Size | < 2MB | ~2.5MB |

---

## 🎯 План действий

### Неделя 1
- [ ] Добавить canonical URL
- [ ] Добавить CSP headers
- [ ] Оптимизировать главную страницу

### Неделя 2
- [ ] Lazy loading для офферов
- [ ] Оптимизация изображений
- [ ] Добавить критические CSS

### Неделя 3
- [ ] Self-hosting шрифтов
- [ ] Сервис-воркер
- [ ] RSS для блога

---

## 🔍 Инструменты для проверки

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Search Console](https://search.google.com/search-console)
- [Яндекс.Вебмастер](https://webmaster.yandex.ru)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

---

## ✅ Чек-лист перед запуском

- [x] Robots.txt настроен
- [x] Sitemap.xml генерируется
- [x] Мета-теги на всех страницах
- [x] Schema.org разметка
- [x] Open Graph и Twitter Cards
- [x] 404 страница
- [x] Редиректы настроены
- [x] Headers безопасности
- [x] Google Analytics
- [x] Яндекс.Метрика
- [ ] Canonical URL
- [ ] CSP headers
- [ ] Critical CSS
- [ ] Image optimization
- [ ] Service Worker
