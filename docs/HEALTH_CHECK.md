# Health Check System

Система мониторинга здоровья сайта МФО агрегатора с ИИ-агентом.

## 🚀 Быстрый старт

### 1. Применение миграций

```bash
npm run db:push
```

### 2. Инициализация начальных страниц

```bash
npx tsx src/lib/health-check-init.ts
```

### 3. Доступ к админ-панели

Откройте в браузере: `http://localhost:3000/admin/health`

## 📊 Возможности

### Мониторинг страниц
- ✅ Проверка HTTP статусов
- ⏱️ Измерение времени ответа
- 🔐 Проверка SSL сертификатов
- 📈 Расчёт uptime (24ч, 7д, 30д)

### Категории страниц
- **main** — главные страницы (приоритет 1)
- **mfo** — страницы МФО (приоритет 2)
- **api** — API endpoints (приоритет 1)
- **static** — статические ресурсы (приоритет 3)

### Статусы
- ✅ **Healthy** — HTTP 200, время < 1 сек
- ⚠️ **Warning** — HTTP 200, время 1-3 сек
- 🟠 **Error** — HTTP 4xx
- 🔴 **Critical** — HTTP 5xx, timeout, SSL ошибка

### Инциденты
- Автоматическое создание при ошибках
- Severity: low, medium, high, critical
- Статусы: open, investigating, resolved
- История инцидентов

### ИИ-агент
- Чат-интерфейс для взаимодействия
- Команды: статус, проблемы, проверь, отчёт
- Контекстная информация о системе

## 🔌 API Endpoints

### GET /api/health/status
Общий статус системы.

**Ответ:**
```json
{
  "success": true,
  "status": {
    "systemStatus": "operational",
    "stats": {
      "total": 10,
      "healthy": 8,
      "warning": 2,
      "error": 0,
      "critical": 0
    },
    "uptime": 99.5,
    "avgResponseTime": 234,
    "activeIncidents": 0
  }
}
```

### GET /api/health/pages
Список страниц в мониторинге.

**Query параметры:**
- `category` — фильтр по категории
- `status` — фильтр по статусу
- `active` — только активные (true/false)

### POST /api/health/pages
Добавить страницу в мониторинг.

**Тело запроса:**
```json
{
  "url": "/mfo/zaymer",
  "name": "Займер",
  "category": "mfo",
  "priority": 2,
  "checkInterval": 180
}
```

### POST /api/health/check
Выполнить проверку страницы.

**Тело запроса:**
```json
{
  "pageId": "clxxx..."
}
```

### GET /api/health/incidents
Список инцидентов.

**Query параметры:**
- `status` — фильтр по статусу
- `severity` — фильтр по severity

### PATCH /api/health/incidents
Обновить инцидент.

**Тело запроса:**
```json
{
  "id": "clxxx...",
  "status": "resolved",
  "resolution": "Проблема устранена"
}
```

### POST /api/health/chat
Чат с ИИ-агентом.

**Тело запроса:**
```json
{
  "message": "статус"
}
```

## 🤖 Команды ИИ-агента

### Мониторинг
- `статус` — общий статус системы
- `проверь [url]` — проверить конкретную страницу
- `проверь все` — проверить все страницы
- `проблемы` — показать активные инциденты

### Отчёты
- `отчёт` — статистика и тренды
- `SLA` — отчёт по SLA

### Управление
- `добавь страницу` — инструкция по добавлению
- `помощь` — все доступные команды

## 📝 Примеры использования

### Добавление новой страницы

```typescript
// Через API
await fetch('/api/health/pages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: '/mfo/new-mfo',
    name: 'Новая МФО',
    category: 'mfo',
    priority: 2,
    checkInterval: 180
  })
});
```

### Проверка страницы

```typescript
// Через API
await fetch('/api/health/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pageId: 'clxxx...'
  })
});
```

### Закрытие инцидента

```typescript
// Через API
await fetch('/api/health/incidents', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'clxxx...',
    status: 'resolved',
    resolution: 'Проблема устранена путём перезапуска сервера'
  })
});
```

## 🎨 Настройка

### Изменение интервалов проверки

```typescript
// В базе данных
await prisma.healthCheckPage.update({
  where: { id: 'clxxx...' },
  data: {
    checkInterval: 60, // 1 минута
    timeout: 10000 // 10 секунд
  }
});
```

### Настройка уведомлений

```typescript
// В базе данных
await prisma.healthCheckPage.update({
  where: { id: 'clxxx...' },
  data: {
    notifyOnError: true,
    notifyOnWarning: false
  }
});
```

## 📊 Модели базы данных

### HealthCheckPage
Страницы для мониторинга.

### HealthCheckResult
Результаты проверок.

### HealthIncident
Инциденты.

### HealthCheckSetting
Настройки системы.

## 🔧 Интеграция с CI/CD

### GitHub Actions

```yaml
name: Health Check
on:
  schedule:
    - cron: '*/5 * * * *' # Каждые 5 минут

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check health
        run: |
          curl -X POST https://your-domain.com/api/health/check \
            -H "Content-Type: application/json" \
            -d '{"pageId": "main"}'
```

## 🚨 Troubleshooting

### Страница не проверяется
1. Проверьте, что страница активна: `isActive: true`
2. Проверьте URL на корректность
3. Убедитесь, что сервер доступен

### Инциденты не создаются
1. Проверьте настройки `notifyOnError`
2. Убедитесь, что нет уже открытого инцидента для этой страницы

### ИИ-агент не отвечает
1. Проверьте подключение к базе данных
2. Убедитесь, что API endpoint `/api/health/chat` доступен

## 📚 Дополнительные ресурсы

- [Промт для ИИ-агента](./seo/AI_AGENT_PROMPT.md)
- [Документация API](./docs/API.md)
- [Руководство по мониторингу](./docs/MONITORING.md)
