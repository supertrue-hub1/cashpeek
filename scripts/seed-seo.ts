/**
 * Streaming CSV Import Script for Programmatic SEO
 * 
 * Импортирует 500K+ строк из CSV в PostgreSQL через Prisma
 * с батчингом и фильтрацией мусорных данных.
 * 
 * Usage: npx tsx scripts/seed-seo.ts
 */

import { PrismaClient } from '@prisma/client';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';
import { createHash } from 'crypto';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Конфигурация
const CONFIG = {
  csvPath: process.env.CSV_PATH || 'D:\\mfogg\\seo\\seo_combinations.csv',
  batchSize: 3000, // Размер батча для вставки
  skipLines: 0, // Сколько строк пропустить (если нужно)
  dryRun: false, // Тестовый режим без записи в БД
};

// Маппинг типов займов в слаги
const LOAN_TYPE_SLUGS: Record<string, string> = {
  'Займы онлайн': 'zaimy-online',
  'Займы на карту': 'zaimy-na-kartu',
  'Займы без отказа': 'zaimy-bez-otkaza',
  'Займы без проверки кредитной истории': 'zaimy-bez-proverki-kreditnoj-istorii',
  'Займы до зарплаты': 'zaimy-do-zarplaty',
  'Займы наличными': 'zaimy-nalichnymi',
  'Быстрые займы': 'bystrye-zaimy',
  'Долгосрочные займы': 'dolgosrochnye-zaimy',
  'Краткосрочные займы': 'kratkosrochnye-zaimy',
  'Микрозаймы': 'mikrozaimy',
};

// Маппинг сроков в слаги
const TERM_SLUGS: Record<string, string> = {
  'на 7 дней': 'na-7-dney',
  'на 14 дней': 'na-14-dney',
  'на 30 дней': 'na-30-dney',
  'на месяц': 'na-mesyac',
  'на 3 месяца': 'na-3-mesyaca',
  'на полгода': 'na-polgoda',
  'на год': 'na-god',
};

// Статистика импорта
const stats = {
  total: 0,
  processed: 0,
  skipped: 0,
  inserted: 0,
  errors: 0,
  batches: 0,
  startTime: Date.now(),
};

/**
 * Транслитерация кириллицы в латиницу для URL
 */
function transliterate(str: string): string {
  const ru: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
    'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
    'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
    'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '',
    'э': 'e', 'ю': 'yu', 'я': 'ya',
  };
  
  return str
    .toLowerCase()
    .split('')
    .map(char => ru[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Извлечение числового значения из строки суммы
 */
function parseAmount(amountStr: string): number {
  const match = amountStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Генерация URL-пути
 */
function generateUrlPath(citySlug: string, loanTypeSlug: string, amountSlug: string, termSlug: string): string {
  return `/${loanTypeSlug}/${citySlug}/${amountSlug}/${termSlug}`;
}

/**
 * Генерация хэша контента для дедупликации
 */
function generateContentHash(row: ParsedRow): string {
  const content = `${row.city}|${row.loanType}|${row.amount}|${row.term}`;
  return createHash('md5').update(content).digest('hex');
}

/**
 * Вычисление приоритета страницы
 */
function calculatePriority(city: string, amountValue: number): number {
  // Города-миллионники получают приоритет 10
  const millionCities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
    'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
    'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград'];
  
  if (millionCities.includes(city)) return 10;
  
  // Популярные суммы получают приоритет 7
  const popularAmounts = [5000, 10000, 15000, 20000, 30000];
  if (popularAmounts.includes(amountValue)) return 7;
  
  // Средние суммы
  if (amountValue >= 5000 && amountValue <= 50000) return 5;
  
  return 3;
}

/**
 * Интерфейс распарсенной строки
 */
interface ParsedRow {
  city: string;
  citySlug: string;
  loanType: string;
  loanTypeSlug: string;
  amount: string;
  amountValue: number;
  amountSlug: string;
  term: string;
  termSlug: string;
  pageTitle: string;
  pageDescription: string;
  urlPath: string;
  contentHash: string;
  priority: number;
}

/**
 * Парсинг одной строки CSV
 */
function parseCsvLine(line: string): ParsedRow | null {
  const parts = line.split(',');
  
  // Минимум 6 полей
  if (parts.length < 6) return null;
  
  const city = parts[0].trim();
  const loanType = parts[1].trim();
  const amount = parts[2].trim();
  const term = parts[3].trim();
  const pageTitle = parts[4].trim();
  const pageDescription = parts.slice(5).join(',').trim(); // Description может содержать запятые
  
  // Фильтрация мусора
  if (city === 'address' || city === 'city' || !city) {
    return null;
  }
  
  // Генерация слагов
  const citySlug = transliterate(city);
  const loanTypeSlug = LOAN_TYPE_SLUGS[loanType] || transliterate(loanType);
  const termSlug = TERM_SLUGS[term] || transliterate(term);
  const amountValue = parseAmount(amount);
  const amountSlug = `${amountValue}-rubley`;
  
  // Генерация URL
  const urlPath = generateUrlPath(citySlug, loanTypeSlug, amountSlug, termSlug);
  
  // Хэш и приоритет
  const contentHash = generateContentHash({ city, loanType, amount, term } as ParsedRow);
  const priority = calculatePriority(city, amountValue);
  
  return {
    city,
    citySlug,
    loanType,
    loanTypeSlug,
    amount,
    amountValue,
    amountSlug,
    term,
    termSlug,
    pageTitle,
    pageDescription,
    urlPath,
    contentHash,
    priority,
  };
}

/**
 * Батчевая вставка в БД
 */
async function insertBatch(batch: ParsedRow[]): Promise<void> {
  if (CONFIG.dryRun) {
    stats.inserted += batch.length;
    return;
  }
  
  try {
    await prisma.seoCombination.createMany({
      data: batch.map(row => ({
        city: row.city,
        citySlug: row.citySlug,
        loanType: row.loanType,
        loanTypeSlug: row.loanTypeSlug,
        amount: row.amount,
        amountValue: row.amountValue,
        term: row.term,
        termSlug: row.termSlug,
        pageTitle: row.pageTitle,
        pageDescription: row.pageDescription,
        urlPath: row.urlPath,
        contentHash: row.contentHash,
        priority: row.priority,
        variationSeed: (row.citySlug.length * 13) % 100,
      })),
      skipDuplicates: true, // Пропускать дубликаты
    });
    
    stats.inserted += batch.length;
    stats.batches++;
  } catch (error) {
    console.error(`❌ Error inserting batch: ${error}`);
    stats.errors += batch.length;
  }
}

/**
 * Основная функция импорта
 */
async function main() {
  console.log('🚀 Starting SEO combinations import...');
  console.log(`📁 CSV path: ${CONFIG.csvPath}`);
  console.log(`📦 Batch size: ${CONFIG.batchSize}`);
  console.log(`🧪 Dry run: ${CONFIG.dryRun}`);
  console.log('');
  
  // Очистка таблицы перед импортом (опционально)
  if (!CONFIG.dryRun) {
    const confirmClear = process.env.CLEAR_TABLE === 'true';
    if (confirmClear) {
      console.log('🗑️ Clearing existing data...');
      await prisma.seoCombination.deleteMany({});
      console.log('✅ Table cleared');
    }
  }
  
  // Создаём поток чтения
  const fileStream = createReadStream(CONFIG.csvPath, { encoding: 'utf8' });
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  
  let batch: ParsedRow[] = [];
  let lineNumber = 0;
  
  // Читаем файл построчно
  for await (const line of rl) {
    lineNumber++;
    stats.total++;
    
    // Пропуск заголовка
    if (lineNumber === 1) {
      console.log(`📋 Header: ${line}`);
      continue;
    }
    
    // Парсим строку
    const parsed = parseCsvLine(line);
    
    if (!parsed) {
      stats.skipped++;
      continue;
    }
    
    stats.processed++;
    batch.push(parsed);
    
    // Вставляем батч
    if (batch.length >= CONFIG.batchSize) {
      await insertBatch(batch);
      batch = [];
      
      // Прогресс
      const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
      const rate = Math.round(stats.processed / parseFloat(elapsed));
      process.stdout.write(
        `\r⏳ Processed: ${stats.processed.toLocaleString()} | ` +
        `Inserted: ${stats.inserted.toLocaleString()} | ` +
        `Skipped: ${stats.skipped.toLocaleString()} | ` +
        `Rate: ${rate}/s | ` +
        `Time: ${elapsed}s`
      );
    }
  }
  
  // Вставляем оставшийся батч
  if (batch.length > 0) {
    await insertBatch(batch);
  }
  
  // Итоговая статистика
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  console.log('\n');
  console.log('════════════════════════════════════════');
  console.log('📊 IMPORT COMPLETED');
  console.log('════════════════════════════════════════');
  console.log(`📄 Total lines:     ${stats.total.toLocaleString()}`);
  console.log(`✅ Processed:       ${stats.processed.toLocaleString()}`);
  console.log(`💾 Inserted:        ${stats.inserted.toLocaleString()}`);
  console.log(`⏭️ Skipped:         ${stats.skipped.toLocaleString()}`);
  console.log(`❌ Errors:          ${stats.errors.toLocaleString()}`);
  console.log(`📦 Batches:         ${stats.batches}`);
  console.log(`⏱️ Time:            ${elapsed}s`);
  console.log(`⚡ Rate:            ${Math.round(stats.processed / parseFloat(elapsed))} rows/s`);
  console.log('════════════════════════════════════════');
  
  await prisma.$disconnect();
}

// Запуск
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
