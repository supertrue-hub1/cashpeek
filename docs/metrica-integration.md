# Интеграция с Яндекс.Метрикой

## Обзор

Реализована безопасная интеграция с API Яндекс.Метрики v3 для отображения аналитики в админ-панели.

### Архитектура

```
Browser (UI) → API Route (/api/admin/metrics) → Yandex Metrica API
                     ↓
              Next.js Cache (15 мин)
                     ↓
              In-memory Cache
```

## Настройка

### 1. Создание приложения Яндекс

1. Перейдите на [oauth.yandex.ru](https://oauth.yandex.ru)
2. Нажмите "Зарегистрировать новое приложение"
3. Заполните поля:
   - **Название**: "Cashpeek Analytics" (или любое)
   - **Платформы**: "Веб-сервисы"
   - **Redirect URI**: `https://oauth.yandex.ru/verification_code`
   - **Доступ к данным**: `metrika:read` (только чтение)
4. Нажмите "Создать приложение"
5. Сохраните **Client ID** и **Client Secret**

### 2. Получение OAuth-токена

**Способ 1: Через браузер (рекомендуется)**

1. Сформируйте URL для авторизации:
```
https://oauth.yandex.ru/authorize?response_type=token&client_id=YOUR_CLIENT_ID
```

2. Перейдите по URL в браузере
3. Разрешите доступ приложению
4. Скопируйте токен из URL (`access_token=...`)

**Способ 2: Через curl (для серверной авторизации)**

```bash
curl -X POST 'https://oauth.yandex.ru/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'code=YOUR_CODE' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET'
```

### 3. Настройка переменных окружения

Добавьте в `.env`:

```env
# ID счетчика Яндекс.Метрики (уже должен быть)
NEXT_PUBLIC_YM_ID="12345678"

# OAuth-токен для API (секретный!)
METRICA_TOKEN="y0_AgAAAAA..."
```

### 4. Проверка

1. Запустите сервер: `bun dev`
2. Перейдите в админ-панель: `/admin/analytics`
3. Откройте вкладку "Метрика"
4. Должны отобразиться данные из Яндекс.Метрики

## API Endpoints

### GET `/api/admin/metrics`

Получение данных из Яндекс.Метрики.

**Параметры:**

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `type` | string | `all` | Тип данных: `all`, `visits`, `top-pages`, `traffic`, `daily`, `goals` |
| `days` | number | `7` | Период в днях (1-365) |
| `limit` | number | `10` | Лимит записей (для top-pages, traffic) |
| `goalIds` | string | - | ID целей через запятую |

**Примеры:**

```bash
# Полный отчёт
curl /api/admin/metrics?days=7

# Только визиты
curl /api/admin/metrics?type=visits&days=30

# Топ страниц
curl /api/admin/metrics?type=top-pages&days=7&limit=20

# Конверсии по целям
curl /api/admin/metrics?type=goals&goalIds=12345,67890
```

**Ответ:**

```json
{
  "success": true,
  "data": {
    "visits": {
      "visits": 12345,
      "pageviews": 45678,
      "visitors": 8901,
      "newVisitors": 3456,
      "bounceRate": 45.2,
      "pageDepth": 3.7,
      "avgVisitDurationSeconds": 156,
      "period": {
        "date1": "2024-01-01",
        "date2": "2024-01-07"
      }
    },
    "topPages": [
      {
        "url": "https://example.com/page",
        "title": "Заголовок страницы",
        "views": 1234,
        "share": 12.5
      }
    ],
    "trafficSources": [
      {
        "source": "search_engine_traffic",
        "name": "Поисковый трафик",
        "visits": 5678,
        "share": 46.0
      }
    ],
    "dailyStats": [
      {
        "date": "2024-01-01",
        "visits": 1500,
        "pageviews": 4500,
        "visitors": 1200
      }
    ],
    "goalConversions": [
      {
        "goalId": "12345",
        "goalName": "Клик по офферу",
        "reaches": 234,
        "conversions": 1.9
      }
    ],
    "lastUpdated": "2024-01-07T12:00:00Z",
    "hasData": true
  },
  "meta": {
    "type": "all",
    "days": 7,
    "timestamp": "2024-01-07T12:00:00Z"
  }
}
```

## Кэширование

### Next.js Cache (ISR)

- **Revalidate**: 900 секунд (15 минут)
- Автоматическое обновление при запросе после истечения срока

### In-memory Cache

- **TTL**: 15 минут
- Хранится в оперативной памяти сервера
- Сбрасывается при перезапуске

### Очистка кэша

Кэш очищается автоматически:
- При изменении периода запроса
- При истечении TTL
- При нажатии кнопки "Обновить" в UI

## Отслеживание целей (Goal Tracking)

### Настройка целей в Яндекс.Метрике

1. Перейдите в [Яндекс.Метрику](https://metrika.yandex.ru)
2. Выберите счётчик → Настройки → Цели
3. Добавьте цели:

| Название | Тип | Условие |
|----------|-----|----------|
| Клик по офферу | JavaScript-событие | `offer_click` |
| Переход на сайт МФО | JavaScript-событие | `mfo_redirect` |
| Отправка заявки | JavaScript-событие | `form_submit` |

### Код для отслеживания

Добавьте в компоненты:

```typescript
// При клике на оффер
const handleOfferClick = (offerId: string) => {
  // Яндекс.Метрика
  if (typeof window !== 'undefined' && (window as any).ym) {
    (window as any).ym(METRIKA_ID, 'reachGoal', 'offer_click', {
      offer_id: offerId,
    })
  }
  
  // Ваша логика
  window.open(affiliateUrl, '_blank')
}
```

### Получение данных о целях

```bash
# Укажите ID целей
curl /api/admin/metrics?type=goals&goalIds=12345,67890
```

## Обработка ошибок

### Возможные ошибки

| Код | Описание | Решение |
|-----|----------|---------|
| 401 | `METRICA_TOKEN не настроен` | Добавьте токен в `.env` |
| 401 | `NEXT_PUBLIC_YM_ID не настроен` | Добавьте ID счётчика в `.env` |
| 403 | `Недостаточно прав` | Проверьте права токена (`metrika:read`) |
| 404 | `Счётчик не найден` | Проверьте ID счётчика |
| 429 | `Превышен лимит запросов` | Увеличьте интервал кэширования |
| 500 | `Ошибка API` | Проверьте логи сервера |

### Fallback UI

Если данные недоступны, компонент отображает:
- При отсутствии токена: инструкция по настройке
- При ошибке API: сообщение об ошибке + кнопка "Повторить"
- При пустых данных: "Нет данных за период"

## Безопасность

### ✅ Правильно

- API-токен хранится на сервере (`METRICA_TOKEN`)
- Запросы к Метрике идут через API Route
- Проверка авторизации в API Route
- Кэширование для защиты от DDoS

### ❌ Неправильно

- ❌ Хранить токен в клиентском коде
- ❌ Делать запросы к Метрике напрямую из браузера
- ❌ Передавать токен в URL-параметрах
- ❌ Логировать токен в консоль

## Структура файлов

```
src/lib/metrica/
├── types.ts          # Типы API
├── client.ts         # HTTP клиент с кэшированием
├── queries.ts        # Готовые запросы
└── index.ts          # Публичный API

src/app/api/admin/metrics/
└── route.ts          # API proxy endpoint

src/components/admin/
└── metrica-stats.tsx # UI компонент

src/app/admin/analytics/
└── page.tsx          # Страница аналитики (интеграция)
```

## Расширение

### Добавление новых метрик

1. Определите метрику в `types.ts`:

```typescript
export const CUSTOM_METRICS = {
  customMetric: 'ym:s:customMetricName',
} as const
```

2. Добавьте запрос в `queries.ts`:

```typescript
export async function getCustomMetric(days: number = 7): Promise<number> {
  const response = await metricaClient.query({
    metrics: CUSTOM_METRICS.customMetric,
    date1: getRelativeDate(days),
    date2: 'today',
  })
  return safeNumber(response.totals[0])
}
```

3. Добавьте endpoint в `route.ts`:

```typescript
case 'custom': {
  const data = await metricaQueries.getCustomMetric(days)
  return NextResponse.json({ success: true, data })
}
```

### Добавление новых измерений

```typescript
// В types.ts
export const CUSTOM_DIMENSIONS = {
  browser: 'ym:s:browser',
  device: 'ym:s:deviceCategory',
  region: 'ym:s:regionCity',
} as const

// В queries.ts
export async function getStatsByBrowser(days: number = 7) {
  const response = await metricaClient.query({
    metrics: VISIT_METRICS.visits,
    dimensions: CUSTOM_DIMENSIONS.browser,
    date1: getRelativeDate(days),
    date2: 'today',
    sort: `-${VISIT_METRICS.visits}`,
  })
  // ...
}
```

## Мониторинг

### Проверка работоспособности

```bash
# Проверка доступности API
curl /api/admin/metrics?type=visits&days=1
```

### Логирование

Все ошибки логируются в консоль сервера:
- `[Metrica API Error]`: ошибки API
- `Error fetching ...`: ошибки при выполнении запросов

## Лицензия

MIT
