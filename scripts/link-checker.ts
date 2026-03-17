/**
 * Broken Link Guardian - Link Checker Script
 * 
 * Проверяет внешние ссылки офферов на доступность
 * Использует HEAD запросы для экономии трафика
 * 
 * Запуск: npx tsx scripts/link-checker.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Конфигурация
const CONFIG = {
  BATCH_SIZE: 100,              // Офферов за батч
  CHECK_INTERVAL_HOURS: 24,     // Проверять каждые 24 часа
  REQUEST_TIMEOUT_MS: 5000,     // Таймаут запроса (5 сек)
  DELAY_BETWEEN_BATCHES_MS: 1000, // Пауза между батчами (1 сек)
  DELAY_BETWEEN_REQUESTS_MS: 100, // Пауза между запросами (100мс)
  MAX_CONSECUTIVE_ERRORS: 10,   // Лимит битых ссылок для алерта
};

// HTTP статусы, которые считаем "битыми"
const BROKEN_STATUS_CODES = [0, 400, 401, 403, 404, 405, 410, 500, 502, 503, 504];

// Статусы, которые НЕ считаем битыми (ignore)
const IGNORED_STATUS_CODES = [403]; // 403 может быть нормально (анти-бот защита)

interface CheckResult {
  offerId: string;
  url: string;
  statusCode: number | null;
  responseTime: number | null;
  isBroken: boolean;
  errorType: string | null;
  errorMessage: string | null;
}

interface CheckSummary {
  total: number;
  broken: number;
  fixed: number;
  stillBroken: number;
  errors: number;
  bySource: Record<string, { total: number; broken: number }>;
}

/**
 * Проверка одной ссылки
 */
async function checkUrl(url: string): Promise<{
  statusCode: number | null;
  responseTime: number | null;
  errorType: string | null;
  errorMessage: string | null;
}> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      // Не-follow редиректы для speed
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      statusCode: response.status,
      responseTime,
      errorType: null,
      errorMessage: null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Определяем тип ошибки
    let errorType = 'unknown';
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorType = 'network_error';
    } else if (error instanceof Error && error.name === 'AbortError') {
      errorType = 'timeout';
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('DNS')) {
      errorType = 'dns_error';
    } else if (errorMessage.includes('ECONNREFUSED')) {
      errorType = 'connection_refused';
    }
    
    return {
      statusCode: null,
      responseTime,
      errorType,
      errorMessage,
    };
  }
}

/**
 * Основная функция проверки
 */
async function checkLinks(): Promise<CheckSummary> {
  console.log('\n🔍 Broken Link Guardian - Starting check...\n');
  
  const summary: CheckSummary = {
    total: 0,
    broken: 0,
    fixed: 0,
    stillBroken: 0,
    errors: 0,
    bySource: {},
  };
  
  // Находим офферы для проверки:
  // 1. Не проверявшиеся никогда
  // 2. Или не проверявшиеся > 24 часов
  // 3. У которых есть affiliateUrl
  // 4. Которые не в архиве
  const checkThreshold = new Date(Date.now() - CONFIG.CHECK_INTERVAL_HOURS * 60 * 60 * 1000);
  
  const offersToCheck = await prisma.loanOffer.findMany({
    where: {
      affiliateUrl: { not: null },
      status: { not: 'archived' },
      OR: [
        { lastChecked: null },
        { lastChecked: { lt: checkThreshold } },
      ],
    },
    select: {
      id: true,
      name: true,
      affiliateUrl: true,
      syncSource: true,
      isBroken: true,
      ignoreBroken: true,
    },
    take: CONFIG.BATCH_SIZE,
    orderBy: { lastChecked: 'asc' }, // Сначала старые
  });
  
  if (offersToCheck.length === 0) {
    console.log('✅ No offers to check');
    return summary;
  }
  
  console.log(`📋 Found ${offersToCheck.length} offers to check`);
  
  // Группируем по source для статистики
  for (const offer of offersToCheck) {
    const source = offer.syncSource || 'direct';
    if (!summary.bySource[source]) {
      summary.bySource[source] = { total: 0, broken: 0 };
    }
    summary.bySource[source].total++;
  }
  
  // Проверяем каждый оффер
  for (const offer of offersToCheck) {
    if (!offer.affiliateUrl) continue;
    
    // Пропускаем если стоит игнор
    if (offer.ignoreBroken) {
      console.log(`   ⏭️  Skipping ${offer.name} (ignored)`);
      continue;
    }
    
    summary.total++;
    console.log(`   🔗 Checking: ${offer.name}`);
    console.log(`      URL: ${offer.affiliateUrl}`);
    
    const result = await checkUrl(offer.affiliateUrl);
    
    // Небольшая пауза между запросами
    await new Promise(r => setTimeout(r, CONFIG.DELAY_BETWEEN_REQUESTS_MS));
    
    // Определяем, битая ли ссылка
    const isBroken = result.statusCode === null 
      ? true 
      : BROKEN_STATUS_CODES.includes(result.statusCode) 
        && !IGNORED_STATUS_CODES.includes(result.statusCode);
    
    // Логируем результат
    await prisma.linkCheckLog.create({
      data: {
        offerId: offer.id,
        url: offer.affiliateUrl,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        isBroken,
        errorType: result.errorType,
        errorMessage: result.errorMessage,
      },
    });
    
    // Обновляем оффер
    const wasBroken = offer.isBroken;
    
    await prisma.loanOffer.update({
      where: { id: offer.id },
      data: {
        lastChecked: new Date(),
        httpStatus: result.statusCode,
        isBroken,
        brokenSince: isBroken && !wasBroken ? new Date() : undefined,
        brokenReason: isBroken ? (result.errorType || `HTTP ${result.statusCode}`) : null,
        // Если ссылка стала рабочей - активируем
        status: !isBroken && wasBroken ? 'published' : undefined,
      },
    });
    
    // Обновляем статистику
    if (isBroken) {
      summary.broken++;
      summary.bySource[offer.syncSource || 'direct'].broken++;
      if (wasBroken) {
        summary.stillBroken++;
      }
      console.log(`      ❌ BROKEN: ${result.statusCode || result.errorType}`);
    } else {
      if (wasBroken) {
        summary.fixed++;
        console.log(`      ✅ FIXED (was broken)`);
      } else {
        console.log(`      ✅ OK (${result.statusCode}, ${result.responseTime}ms)`);
      }
    }
  }
  
  return summary;
}

/**
 * Отправка алерта в Telegram
 */
async function sendTelegramAlert(summary: CheckSummary) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('\n⚠️  Telegram not configured, skipping alert');
    return;
  }
  
  // Проверяем порог
  if (summary.broken < CONFIG.MAX_CONSECUTIVE_ERRORS) {
    return;
  }
  
  const message = `
🔴 <b>Broken Link Alert!</b>

Found <b>${summary.broken}</b> broken links (threshold: ${CONFIG.MAX_CONSECUTIVE_ERRORS})

📊 Statistics:
• Total checked: ${summary.total}
• Broken: ${summary.broken}
• Fixed: ${summary.fixed}
• Still broken: ${summary.stillBroken}

📍 By Source:
${Object.entries(summary.bySource).map(([source, stats]) => 
  `• ${source}: ${stats.broken}/${stats.total} broken`
).join('\n')}
  `.trim();
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    console.log('\n📱 Telegram alert sent');
  } catch (error) {
    console.error('\n❌ Failed to send Telegram alert:', error);
  }
}

/**
 * Вывод итогов
 */
function printSummary(summary: CheckSummary) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 CHECK SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total checked:    ${summary.total}`);
  console.log(`Broken:           ${summary.broken} ❌`);
  console.log(`Fixed:            ${summary.fixed} ✅`);
  console.log(`Still broken:     ${summary.stillBroken}`);
  console.log(`Errors:           ${summary.errors}`);
  console.log('\n📍 By Source:');
  for (const [source, stats] of Object.entries(summary.bySource)) {
    console.log(`  ${source}: ${stats.broken}/${stats.total} broken`);
  }
  console.log('='.repeat(50) + '\n');
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Broken Link Guardian v1.0');
  console.log(`   Batch size: ${CONFIG.BATCH_SIZE}`);
  console.log(`   Check interval: ${CONFIG.CHECK_INTERVAL_HOURS}h`);
  console.log(`   Timeout: ${CONFIG.REQUEST_TIMEOUT_MS}ms`);
  
  try {
    const summary = await checkLinks();
    printSummary(summary);
    
    // Алерт если много битых ссылок
    if (summary.broken >= CONFIG.MAX_CONSECUTIVE_ERRORS) {
      await sendTelegramAlert(summary);
    }
    
    console.log('✅ Link check completed');
  } catch (error) {
    console.error('\n❌ Link check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
