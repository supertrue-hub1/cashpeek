/**
 * Скрипт импорта SEO-комбинаций - версия для bun/node
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Маппинг типов займов из JSON к slug категориям
const LOAN_TYPE_MAPPING: Record<string, string> = {
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

// Транслитерация для slug
function transliterate(text: string): string {
  const ru: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ё': 'yo',
    ' ': '-',
  };
  
  return text.toLowerCase().split('').map(char => ru[char] || char).join('');
}

// Генерация slug для города
function generateCitySlug(cityName: string): string {
  return transliterate(cityName.replace(/[^а-яё\s]/gi, ''));
}

// Парсинг суммы из строки "1000 рублей" -> 1000
function parseAmount(amountStr: string): { value: number | null; slug: string | null } {
  const match = amountStr.match(/(\d+)/);
  const value = match ? parseInt(match[1]) : null;
  return { value, slug: value ? value.toString() : null };
}

// Парсинг срока из строки "на 7 дней" -> { days: 7, slug: "7-dney" }
function parseTerm(termStr: string): { days: number | null; slug: string | null } {
  const dayMatch = termStr.match(/на\s*(\d+)\s*день/i);
  const monthMatch = termStr.match(/на\s*(\d+)\s*месяц/i);
  const yearMatch = termStr.match(/на\s*(\d+)\s*год/i);
  
  let days: number | null = null;
  let slug: string | null = null;
  
  if (dayMatch) {
    days = parseInt(dayMatch[1]);
    slug = `${days}-dney`;
    if (days > 1 && days < 5) slug = `${days}-dnya`;
  } else if (monthMatch) {
    const months = parseInt(monthMatch[1]);
    days = months * 30;
    slug = months === 1 ? 'mesyac' : `${months}-mesyacev`;
  } else if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    days = years * 365;
    slug = years === 1 ? 'god' : `${years}-let`;
  }
  
  return { days, slug };
}

interface SeoCombination {
  city: string;
  loan_type: string;
  amount: string;
  term: string;
  page_title: string;
  page_description: string;
}

async function importFromJson(filePath: string) {
  console.log(`📂 Читаю файл: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const data: SeoCombination[] = JSON.parse(content);
  
  console.log(`📊 Всего записей: ${data.length}`);
  
  // Фильтруем строки с address
  const validData = data.filter(item => item.city !== 'address' && item.city.trim() !== '');
  console.log(`✅ После фильтрации address: ${validData.length}`);
  
  // Группируем по городам и типам
  const citiesMap = new Map<string, { name: string; slug: string }>();
  const loanTypesMap = new Map<string, { name: string; slug: string }>();
  
  for (const item of validData) {
    const citySlug = generateCitySlug(item.city);
    if (!citiesMap.has(citySlug)) {
      citiesMap.set(citySlug, { name: item.city, slug: citySlug });
    }
    
    const categorySlug = LOAN_TYPE_MAPPING[item.loan_type] || 'onlain';
    if (!loanTypesMap.has(categorySlug)) {
      loanTypesMap.set(categorySlug, { name: item.loan_type, slug: categorySlug });
    }
  }
  
  console.log(`🏙 Уникальных городов: ${citiesMap.size}`);
  console.log(`📋 Уникальных типов займов: ${loanTypesMap.size}`);
  
  // Создаем/обновляем города
  console.log('\n🏙 Создаю города...');
  for (const [slug, city] of citiesMap) {
    await prisma.seoCity.upsert({
      where: { slug },
      update: { name: city.name },
      create: {
        name: city.name,
        slug,
        preposition: `в ${city.name}`,
        genitive: city.name,
        isActive: true,
        priority: 10,
      },
    });
  }
  
  // Создаем/обновляем типы займов
  console.log('📋 Создаю типы займов...');
  for (const [slug, loanType] of loanTypesMap) {
    await prisma.seoLoanType.upsert({
      where: { slug },
      update: { name: loanType.name },
      create: {
        name: loanType.name,
        slug,
        namePrepositional: loanType.name.toLowerCase(),
        categorySlug: slug,
        isActive: true,
      },
    });
  }
  
  // Импортируем страницы
  console.log('\n📄 Импортирую страницы...');
  let imported = 0;
  let skipped = 0;
  
  // Получаем все города и типы для быстрого поиска
  const cities = await prisma.seoCity.findMany({ select: { id: true, slug: true } });
  const loanTypes = await prisma.seoLoanType.findMany({ select: { id: true, slug: true } });
  
  const cityBySlug = new Map(cities.map(c => [c.slug, c.id]));
  const loanTypeBySlug = new Map(loanTypes.map(l => [l.slug, l.id]));
  
  for (const item of validData) {
    const citySlug = generateCitySlug(item.city);
    const categorySlug = LOAN_TYPE_MAPPING[item.loan_type] || 'onlain';
    const { value: amountValue, slug: amountSlug } = parseAmount(item.amount);
    const { days: termDays, slug: termSlug } = parseTerm(item.term);
    
    const cityId = cityBySlug.get(citySlug);
    const loanTypeId = loanTypeBySlug.get(categorySlug);
    
    if (!cityId || !loanTypeId) {
      skipped++;
      continue;
    }
    
    const urlPath = `/zaimy/${categorySlug}/v-${citySlug}`;
    
    // Priority: чем больше населения (выше в списке), тем выше приоритет
    const priority = cityBySlug.has(citySlug) ? 8 : 5;
    
    await prisma.seoPage.upsert({
      where: {
        cityId_loanTypeId_amount_term: {
          cityId,
          loanTypeId,
          amount: amountValue || 0,
          term: termDays || 0,
        },
      },
      update: {
        pageTitle: item.page_title,
        pageDescription: item.page_description,
        amount: amountValue,
        amountSlug: amountSlug || undefined,
        term: termDays,
        termSlug: termSlug || undefined,
        urlPath,
        isIndexable: true,
        noIndex: false,
        priority,
      },
      create: {
        cityId,
        loanTypeId,
        amount: amountValue,
        amountSlug: amountSlug || undefined,
        term: termDays,
        termSlug: termSlug || undefined,
        pageTitle: item.page_title,
        pageDescription: item.page_description,
        urlPath,
        isIndexable: true,
        noIndex: false,
        priority,
        status: 'published',
      },
    });
    
    imported++;
    
    if (imported % 1000 === 0) {
      console.log(`  Импортировано: ${imported}/${validData.length}`);
    }
  }
  
  console.log(`\n✅ Импорт завершен!`);
  console.log(`   Импортировано: ${imported}`);
  console.log(`   Пропущено: ${skipped}`);
  
  // Вывод статистики
  const totalPages = await prisma.seoPage.count();
  const indexablePages = await prisma.seoPage.count({ where: { isIndexable: true, noIndex: false } });
  
  console.log(`\n📈 Статистика:`);
  console.log(`   Всего страниц в БД: ${totalPages}`);
  console.log(`   Индексируемых: ${indexablePages}`);
}

async function main() {
  console.log('🚀 Начинаю импорт SEO-комбинаций...\n');
  
  const isTest = process.argv.includes('--test');
  
  try {
    if (isTest) {
      const jsonPath = path.join(process.cwd(), 'seo', 'seo_combinations_10k.json');
      if (!fs.existsSync(jsonPath)) {
        console.error('❌ Файл seo_combinations_10k.json не найден!');
        process.exit(1);
      }
      await importFromJson(jsonPath);
    }
    
    // Вывод итоговой статистики
    console.log('\n📊 Итоговая статистика БД:');
    console.log(`   Городов: ${await prisma.seoCity.count()}`);
    console.log(`   Типов займов: ${await prisma.seoLoanType.count()}`);
    console.log(`   SEO-страниц: ${await prisma.seoPage.count()}`);
    
  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
