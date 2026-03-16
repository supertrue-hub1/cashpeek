/**
 * Скрипт импорта SEO-комбинаций - CommonJS версия
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Маппинг типов займов из JSON к slug категориям
const LOAN_TYPE_MAPPING = {
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
function transliterate(text) {
  const ru = {
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
function generateCitySlug(cityName) {
  return transliterate(cityName.replace(/[^а-яё\s]/gi, ''));
}

// Парсинг суммы
function parseAmount(amountStr) {
  const match = amountStr.match(/(\d+)/);
  const value = match ? parseInt(match[1]) : null;
  return { value, slug: value ? value.toString() : null };
}

// Парсинг срока
function parseTerm(termStr) {
  const dayMatch = termStr.match(/на\s*(\d+)\s*день/i);
  const monthMatch = termStr.match(/на\s*(\d+)\s*месяц/i);
  const yearMatch = termStr.match(/на\s*(\d+)\s*год/i);
  
  let days = null;
  let slug = null;
  
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

async function importFromJson(filePath) {
  console.log(`📂 Читаю файл: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  console.log(`📊 Всего записей: ${data.length}`);
  
  // Фильтруем строки с address
  const validData = data.filter(item => item.city !== 'address' && item.city.trim() !== '');
  console.log(`✅ После фильтрации address: ${validData.length}`);
  
  // Группируем по городам и типам
  const citiesMap = new Map();
  const loanTypesMap = new Map();
  
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
  
  // Создаем города
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
  
  // Создаем типы займов
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
  
  // Очищаем старые страницы для чистого теста
  console.log('🗑 Очищаю старые страницы...');
  await prisma.seoPage.deleteMany({});
  
  // Импортируем страницы
  console.log('\n📄 Импортирую страницы...');
  let imported = 0;
  let skipped = 0;
  
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
    
    // URL с учетом суммы и срока
    let urlPath = `/zaimy/${categorySlug}/v-${citySlug}`;
    if (amountValue) {
      urlPath = `/zaimy/do-${amountValue}-rublei/v-${citySlug}`;
    }
    if (termDays) {
      urlPath += `?term=${termDays}`;
    }
    
    // Пропускаем дубликаты по urlPath
    const existing = await prisma.seoPage.findUnique({ where: { urlPath } });
    if (existing) {
      skipped++;
      continue;
    }
    
    const priority = 8;
    
    await prisma.seoPage.upsert({
      where: { urlPath },
      update: {
        pageTitle: item.page_title,
        pageDescription: item.page_description,
        amount: amountValue,
        amountSlug: amountSlug || undefined,
        term: termDays,
        termSlug: termSlug || undefined,
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
