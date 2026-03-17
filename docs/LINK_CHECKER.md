# Broken Link Guardian - Автоматизация

## Обзор

Система проверки внешних ссылок офферов на доступность. Предотвращает SEO-штрафы от Google за битые ссылки.

## Быстрый старт

### 1. Применение миграции

```bash
npx prisma db push
npx prisma generate
```

### 2. Ручной запуск

```bash
npx tsx scripts/link-checker.ts
```

## Автоматизация

### Вариант А: Vercel Cron Jobs (рекомендуемый)

Создайте файл `vercel.json` в корне проекта:

```json
{
  "crons": [
    {
      "path": "/api/cron/link-checker",
      "schedule": "0 6 * * *"
    }
  ]
}
```

Создайте API endpoint `/api/cron/link-checker`:

```typescript
// src/app/api/cron/link-checker/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Secret key for cron security
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Проверяем secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Логика проверки ссылок (см. scripts/link-checker.ts)
  // ...
  
  return NextResponse.json({ success: true, checked: 100, broken: 5 });
}
```

### Вариант Б: node-cron (Docker/выделенный сервер)

Установите зависимости:

```bash
npm install node-cron dotenv
```

Создайте `scripts/cron-runner.ts`:

```typescript
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Запуск каждый день в 6:00 утра
cron.schedule('0 6 * * *', async () => {
  console.log('🔍 Starting link check...');
  
  // Ваша логика проверки
  // (импортируйте из link-checker.ts)
  
  console.log('✅ Link check completed');
});

// Запуск каждую неделю (воскресенье в 3:00)
cron.schedule('0 3 * * 0', async () => {
  console.log('📊 Weekly link report...');
  // Отправка отчёта в Telegram
});

console.log('⏰ Cron scheduler started');
```

Запуск:

```bash
npx tsx scripts/cron-runner.ts
```

### Вариант В: GitHub Actions

```yaml
# .github/workflows/link-check.yml
name: Link Checker

on:
  schedule:
    - cron: '0 6 * * *'  # Ежедневно в 6:00
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      - run: npx prisma generate
      
      - name: Run link checker
        run: npx tsx scripts/link-checker.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## Переменные окружения

```env
# База данных
DATABASE_URL=postgresql://...

# Telegram (опционально для алертов)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Для Vercel Cron
CRON_SECRET=your_secret_key
```

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/admin/link-checker` | Получить список битых ссылок |
| POST | `/api/admin/link-checker` | Запустить проверку |
| PATCH | `/api/admin/link-checker` | Изменить настройки (ignore) |

## UI в админке

Доступно по адресу: `/admin/broken-links`

Функции:
- Просмотр всех битых ссылок
- Ручная перепроверка
- Игнорирование ссылок
- Архивирование офферов
- Статистика по источникам

## Безопасность

1. **Лимиты**: Проверяется по 100 ссылок за батч
2. **Таймаут**: 5 секунд на запрос
3. **Пауза**: 100ms между запросами
4. **HEAD метод**: Не скачивает контент

## Мониторинг

При обнаружении более 10 битых ссылок подряд отправляется алерт в Telegram (если настроен).

Это может сигнализировать о:
- Падении партнёрской сети
- Смене домена партнёром
- Массовом завершении офферов
