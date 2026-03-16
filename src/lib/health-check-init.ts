/**
 * Скрипт для инициализации Health Check системы
 * Добавляет базовые страницы для мониторинга
 */

import { prisma } from '@/lib/db';

const DEFAULT_PAGES = [
  // Главные страницы
  {
    url: '/',
    name: 'Главная страница',
    category: 'main',
    priority: 1,
    checkInterval: 300, // 5 минут
    expectedStatus: 200,
    maxResponseTime: 1000
  },
  {
    url: '/mfo',
    name: 'Каталог МФО',
    category: 'main',
    priority: 1,
    checkInterval: 300,
    expectedStatus: 200,
    maxResponseTime: 1500
  },
  {
    url: '/about',
    name: 'О компании',
    category: 'main',
    priority: 3,
    checkInterval: 600,
    expectedStatus: 200,
    maxResponseTime: 1000
  },
  {
    url: '/contacts',
    name: 'Контакты',
    category: 'main',
    priority: 3,
    checkInterval: 600,
    expectedStatus: 200,
    maxResponseTime: 1000
  },

  // API endpoints
  {
    url: '/api/v1/mfo',
    name: 'API: Список МФО',
    category: 'api',
    priority: 1,
    checkInterval: 60, // 1 минута
    expectedStatus: 200,
    maxResponseTime: 500
  },
  {
    url: '/api/health',
    name: 'API: Health Check',
    category: 'api',
    priority: 2,
    checkInterval: 120,
    expectedStatus: 200,
    maxResponseTime: 200
  },

  // Статические ресурсы (примеры)
  {
    url: '/css/main.css',
    name: 'CSS: Главные стили',
    category: 'static',
    priority: 4,
    checkInterval: 600, // 10 минут
    expectedStatus: 200,
    maxResponseTime: 500
  }
];

export async function initializeHealthCheck() {
  console.log('🏥 Initializing Health Check system...');

  let added = 0;
  let skipped = 0;

  for (const pageData of DEFAULT_PAGES) {
    try {
      // Проверяем, существует ли уже такая страница
      const existing = await prisma.healthCheckPage.findUnique({
        where: { url: pageData.url }
      });

      if (existing) {
        console.log(`  ⏭️  Skipping ${pageData.url} - already exists`);
        skipped++;
        continue;
      }

      // Создаём страницу
      await prisma.healthCheckPage.create({
        data: pageData
      });

      console.log(`  ✅ Added ${pageData.url}`);
      added++;
    } catch (error) {
      console.error(`  ❌ Failed to add ${pageData.url}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${added + skipped}`);

  return { added, skipped };
}

// Запуск скрипта
if (require.main === module) {
  initializeHealthCheck()
    .then(() => {
      console.log('\n✅ Health Check initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Initialization failed:', error);
      process.exit(1);
    });
}
