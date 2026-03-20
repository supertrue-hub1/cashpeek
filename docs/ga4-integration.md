# Google Analytics 4 Integration

## Настройка GCP и GA4

### Шаг 1: Создание Service Account

1. Откройте [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект или выберите существующий
3. Перейдите в **IAM & Admin → Service Accounts**
4. Нажмите **Create Service Account**:
   - Name: `ga4-analytics-reader`
   - Role: **Viewer** (или кастомная роль с Analytics Data API Read)
5. Нажмите **Done**
6. Кликните на созданный Service Account
7. Перейдите в **Keys → Add Key → Create new key**
8. Выберите **JSON** и скачайте файл

### Шаг 2: Включение Analytics Data API

1. В Google Cloud Console перейдите в **APIs & Services → Library**
2. Найдите **Google Analytics Data API**
3. Нажмите **Enable**

### Шаг 3: Добавление доступа к GA4 Property

1. Откройте [Google Analytics](https://analytics.google.com)
2. Выберите свой GA4 property
3. Перейдите в **Admin → Property Access Management**
4. Нажмите **+ Add users**
5. Введите email Service Account (из credentials.json, поле `client_email`)
6. Роль: **Viewer**
7. Нажмите **Add**

### Шаг 4: Получение Property ID

1. В Google Analytics перейдите в **Admin → Property Settings**
2. Скопируйте **Property ID** (число, например `123456789`)

### Шаг 5: Настройка переменных окружения

Добавьте в `.env`:

```env
# GA4 Property ID
GA4_PROPERTY_ID="123456789"

# Service Account credentials (JSON как строка)
GA4_CREDENTIALS='{"type":"service_account","project_id":"my-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"ga4-reader@my-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/ga4-reader%40my-project.iam.gserviceaccount.com"}'
```

**Важно:** Private key должен содержать `\n` для переносов строк!

## Установка gtag.js на сайт

### 1. Добавьте скрипт в `<head>`

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 2. Отслеживание события `click_mfo_button`

Добавьте в компонент оффера:

```typescript
// src/components/offer-card.tsx

const handleMfoClick = (offerId: string, offerName: string) => {
  // Отправка события в GA4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'click_mfo_button', {
      offer_id: offerId,
      offer_name: offerName,
      timestamp: new Date().toISOString(),
    })
  }

  // Ваша логика перехода
  window.open(affiliateUrl, '_blank')
}
```

### 3. Другие полезные события

```typescript
// Просмотр оффера
gtag('event', 'view_offer', {
  offer_id: offerId,
  offer_name: offerName,
})

// Фильтрация по сумме
gtag('event', 'filter_by_amount', {
  amount: selectedAmount,
})

// Фильтрация по сроку
gtag('event', 'filter_by_term', {
  term: selectedTerm,
})

// Отправка формы
gtag('event', 'submit_form', {
  form_type: 'loan_application',
  offer_id: offerId,
})
```

## API Endpoints

### GET `/api/admin/ga4`

| Параметр | Описание | Пример |
|----------|----------|--------|
| `type` | Тип данных | `all`, `overview`, `daily`, `pages`, `events`, `traffic`, `mfo-clicks` |
| `startDate` | Начало периода | `7daysAgo`, `2024-01-01` |
| `endDate` | Конец периода | `yesterday`, `2024-01-31` |
| `limit` | Лимит записей | `10` (по умолчанию) |
| `eventName` | Название события | `click_mfo_button` |

### Примеры запросов

```bash
# Полный отчёт
GET /api/admin/ga4?startDate=7daysAgo&endDate=yesterday

# Только события
GET /api/admin/ga4?type=events&startDate=30daysAgo

# Конкретное событие
GET /api/admin/ga4?type=event&eventName=click_mfo_button

# Топ страниц
GET /api/admin/ga4?type=pages&limit=20
```

## Кэширование

- **In-memory cache**: 4 часа
- Автоматическое обновление при истечении TTL
- Сброс при перезапуске сервера

## Квоты GA4 Data API

| Тип квоты | Лимит |
|-----------|-------|
| Запросов в день | 25,000 |
| Запросов в час | 5,000 |
| Запросов в минуту | 600 |

Кэширование помогает не превысить лимиты!

## Troubleshooting

### "GA4_PROPERTY_ID не настроен"
→ Добавьте `GA4_PROPERTY_ID` в `.env`

### "GA4_CREDENTIALS содержит невалидный JSON"
→ Проверьте формат JSON, экранирование кавычек и `\n`

### "Permission denied"
→ Добавьте Service Account в пользователи GA4 с ролью Viewer

### "Нет данных"
→ Проверьте, что gtag.js установлен и отправляет события

### Пустой private_key
→ Убедитесь, что переносы строк заменены на `\n`
