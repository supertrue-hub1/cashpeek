import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/health/chat - чат с ИИ-агентом
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message required' },
        { status: 400 }
      );
    }

    // Получаем контекст для агента
    const pages = await db.healthCheckPage.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        url: true,
        category: true,
        lastStatus: true,
        lastResponseTime: true,
        lastCheckAt: true
      },
      take: 50
    });

    const incidents = await db.healthIncident.findMany({
      where: {
        status: { in: ['open', 'investigating'] }
      },
      include: {
        page: {
          select: {
            name: true,
            url: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    const stats = {
      total: pages.length,
      healthy: pages.filter(p => p.lastStatus === 'healthy').length,
      warning: pages.filter(p => p.lastStatus === 'warning').length,
      error: pages.filter(p => p.lastStatus === 'error').length,
      critical: pages.filter(p => p.lastStatus === 'critical').length
    };

    // Парсим команду
    const response = await parseAndExecuteCommand(message, { pages, incidents, stats });

    return NextResponse.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Error in health chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

// Парсинг и выполнение команд
async function parseAndExecuteCommand(
  message: string,
  context: { pages: any[]; incidents: any[]; stats: any }
): Promise<string> {
  const normalized = message.toLowerCase().trim();

  // Команда: статус
  if (normalized.includes('статус') || normalized.includes('состояние') || normalized.includes('как дела')) {
    return generateStatusResponse(context);
  }

  // Команда: проблемы
  if (normalized.includes('проблем') || normalized.includes('инцидент') || normalized.includes('ошибки')) {
    return generateProblemsResponse(context);
  }

  // Команда: проверь
  if (normalized.includes('проверь')) {
    const url = normalized.replace('проверь', '').trim();
    return generateCheckResponse(url, context);
  }

  // Команда: отчёт
  if (normalized.includes('отчёт') || normalized.includes('отчет') || normalized.includes('статистика')) {
    return generateReportResponse(context);
  }

  // Команда: добавить страницу
  if (normalized.includes('добавь') || normalized.includes('добавить')) {
    return `➕ Чтобы добавить страницу в мониторинг, используйте форму на странице настроек или отправьте POST запрос на /api/health/pages с параметрами:
    
**Обязательные поля:**
- url: URL страницы
- name: Название

**Опциональные поля:**
- category: main, mfo, api, static
- checkInterval: интервал в секундах (по умолчанию 300)
- priority: 1-5 (по умолчанию 3)`;
  }

  // Команда: помощь
  if (normalized.includes('помощь') || normalized.includes('команды') || normalized.includes('help')) {
    return `🤖 **Доступные команды:**

**Мониторинг:**
- "статус" — общий статус системы
- "проверь [url]" — проверить конкретную страницу
- "проверь все" — проверить все страницы
- "проблемы" — показать активные инциденты

**Управление:**
- "добавь страницу" — добавить страницу в мониторинг
- "настройки" — показать настройки

**Отчёты:**
- "отчёт" — статистика и тренды
- "SLA" — отчёт по SLA

**Инциденты:**
- "инциденты" — список всех инцидентов
- "закрой [id]" — закрыть инцидент`;
  }

  // Default response
  return `🤔 Я не понял команду. Напишите "помощь" чтобы узнать доступные команды.

📊 **Текущий статус:**
- Страниц в мониторинге: ${context.stats.total}
- Работает: ${context.stats.healthy} (${Math.round(context.stats.healthy / context.stats.total * 100)}%)
- Проблемы: ${context.stats.critical + context.stats.error}
- Активных инцидентов: ${context.incidents.length}`;
}

// Генерация ответа о статусе
function generateStatusResponse(context: { pages: any[]; incidents: any[]; stats: any }): string {
  const { pages, incidents, stats } = context;
  
  const healthyPercent = stats.total > 0 
    ? Math.round((stats.healthy / stats.total) * 100)
    : 0;

  let response = `📊 **Статус системы: ${stats.total} страниц**

`;
  
  // Статусы
  if (stats.healthy > 0) {
    response += `✅ Работает: ${stats.healthy} (${healthyPercent}%)\n`;
  }
  if (stats.warning > 0) {
    response += `⚠️ Предупреждения: ${stats.warning}\n`;
  }
  if (stats.error > 0) {
    response += `🟠 Ошибки: ${stats.error}\n`;
  }
  if (stats.critical > 0) {
    response += `🔴 Критические: ${stats.critical}\n`;
  }

  // Uptime
  const avgUptime = pages.length > 0
    ? Math.round(pages.reduce((sum, p) => sum + (p.lastResponseTime || 0), 0) / pages.length)
    : 0;

  response += `\n⚡ Среднее время ответа: ${avgUptime} мс\n`;

  // Активные инциденты
  if (incidents.length > 0) {
    response += `\n🔴 **Активные инциденты: ${incidents.length}**\n`;
    incidents.slice(0, 3).forEach(inc => {
      const timeAgo = getTimeAgo(inc.startedAt);
      response += `  • #${inc.incidentNumber} — ${inc.page?.name || 'Unknown'} (${timeAgo})\n`;
    });
  } else {
    response += `\n✅ Активных инцидентов нет\n`;
  }

  // Проблемные страницы
  const problemPages = pages.filter(p => 
    p.lastStatus === 'critical' || p.lastStatus === 'error'
  ).slice(0, 3);

  if (problemPages.length > 0) {
    response += `\n⚠️ **Требуют внимания:**\n`;
    problemPages.forEach(p => {
      response += `  • ${p.name} — ${p.lastStatus}\n`;
    });
  }

  return response;
}

// Генерация ответа о проблемах
function generateProblemsResponse(context: { pages: any[]; incidents: any[]; stats: any }): string {
  const { pages, incidents } = context;

  if (incidents.length === 0) {
    return `✅ **Активных проблем нет**

Все системы работают нормально. Последняя проверка выполнена недавно.`;
  }

  let response = `🚨 **Активные инциденты: ${incidents.length}**\n\n`;

  incidents.forEach((inc, index) => {
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '⚠️',
      low: 'ℹ️'
    }[inc.severity] || '⚠️';

    const timeAgo = getTimeAgo(inc.startedAt);
    
    response += `${severityEmoji} **#${inc.incidentNumber}** — ${inc.page?.name || 'Unknown'}\n`;
    response += `   ${inc.title}\n`;
    response += `   Severity: ${inc.severity} | ${timeAgo}\n\n`;
  });

  // Рекомендации
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  
  if (criticalCount > 0) {
    response += `\n💡 **Рекомендуемые действия:**\n`;
    response += `1. Проверьте логи сервера\n`;
    response += `2. Свяжитесь с ответственными\n`;
    response += `3. Проверьте статус провайдера\n`;
  }

  return response;
}

// Генерация ответа о проверке
function generateCheckResponse(url: string, context: { pages: any[]; incidents: any[]; stats: any }): string {
  const { pages } = context;

  if (url === 'все' || url === 'all') {
    return `🔍 Проверка всех страниц...

Для выполнения полной проверки всех страниц используйте кнопку "Проверить все" на дашборде или отправьте POST запрос на /api/health/check для каждой страницы.`;
  }

  // Ищем страницу по URL или имени
  const page = pages.find(p => 
    p.url.toLowerCase().includes(url) || 
    p.name.toLowerCase().includes(url)
  );

  if (!page) {
    return `🔍 Страница "${url}" не найдена в мониторинге.

Доступные страницы:
${pages.slice(0, 5).map(p => `• ${p.name} — ${p.url}`).join('\n')}

Используйте точный URL или название страницы.`;
  }

  // Формируем отчёт о странице
  let response = `🔍 **Проверка: ${page.name}**\n\n`;
  
  const statusEmoji = {
    healthy: '✅',
    warning: '⚠️',
    error: '🟠',
    critical: '🔴',
    unknown: '❓'
  }[page.lastStatus] || '❓';

  response += `${statusEmoji} **Статус:** ${page.lastStatus}\n`;
  
  if (page.lastResponseTime) {
    const timeStatus = page.lastResponseTime < 1000 ? 'норма' : 
                       page.lastResponseTime < 3000 ? 'медленно' : 'критично';
    response += `⏱️ Время: ${page.lastResponseTime} мс (${timeStatus})\n`;
  }

  const timeAgo = page.lastCheckAt ? getTimeAgo(page.lastCheckAt) : 'не проверялась';
  response += `🕐 Последняя проверка: ${timeAgo}\n`;

  // Рекомендация
  if (page.lastStatus === 'healthy') {
    response += `\n✅ Страница работает корректно!`;
  } else if (page.lastStatus === 'warning') {
    response += `\n⚠️ Страница работает, но требует внимания.`;
  } else {
    response += `\n🔴 Страница недоступна. Требуется вмешательство.`;
  }

  return response;
}

// Генерация отчёта
function generateReportResponse(context: { pages: any[]; incidents: any[]; stats: any }): string {
  const { pages, stats } = context;

  const avgResponseTime = pages.length > 0
    ? Math.round(pages.reduce((sum, p) => sum + (p.lastResponseTime || 0), 0) / pages.length)
    : 0;

  const uptimePercent = stats.total > 0
    ? Math.round((stats.healthy / stats.total) * 100)
    : 0;

  let response = `📊 **Отчёт о здоровье системы**

━━━━━━━━━━━━━━━━━━━━━━
📈 **ОБЩАЯ СТАТИСТИКА**
━━━━━━━━━━━━━━━━━━━━━━
Uptime: ${uptimePercent}%
Страниц в мониторинге: ${stats.total}
Среднее время ответа: ${avgResponseTime} мс

✅ Healthy: ${stats.healthy} (${uptimePercent}%)
⚠️ Warning: ${stats.warning}
🟠 Error: ${stats.error}
🔴 Critical: ${stats.critical}

━━━━━━━━━━━━━━━━━━━━━━
📊 **ПО КАТЕГОРИЯМ**
━━━━━━━━━━━━━━━━━━━━━━`;

  const categories = ['main', 'mfo', 'api', 'static'];
  categories.forEach(cat => {
    const catPages = pages.filter(p => p.category === cat);
    if (catPages.length > 0) {
      const catHealthy = catPages.filter(p => p.lastStatus === 'healthy').length;
      const catPercent = Math.round((catHealthy / catPages.length) * 100);
      response += `\n${cat.toUpperCase()}: ${catHealthy}/${catPages.length} (${catPercent}%)`;
    }
  });

  response += `\n\n💡 **Рекомендации:**\n`;
  
  if (stats.critical > 0) {
    response += `1. 🔴 Внимание! Есть критические проблемы\n`;
  }
  if (avgResponseTime > 1000) {
    response += `2. ⚠️ Среднее время ответа высокое\n`;
  }
  if (uptimePercent >= 99) {
    response += `✅ Система работает стабильно\n`;
  }

  return response;
}

// Вспомогательная функция для форматирования времени
function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return `${diffDays} дн назад`;
}
