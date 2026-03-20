/**
 * Sitemap Ping Script
 * Автоматически отправляет пинг в Google и Bing при обновлении sitemap
 * 
 * Использование:
 *   node scripts/sitemap-ping.js
 * 
 * Или через npm:
 *   npm run ping:sitemap
 * 
 * Рекомендуется запускать раз в сутки через cron:
 *   0 6 * * * cd /path/to/project && node scripts/sitemap-ping.js
 */

const SITEMAP_URL = process.env.NEXT_PUBLIC_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`
  : 'https://cashpeek.ru/sitemap.xml';

const PING_URLS = {
  google: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  bing: `https://www.bing.com/indexnow?url=${encodeURIComponent(SITEMAP_URL)}&key=seo-cashpeek-2026`,
  yandex: `https://webmaster.yandex.ru/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
};

/**
 * Отправляет пинг в поисковую систему
 */
async function pingSearchEngine(name: string, url: string): Promise<boolean> {
  try {
    console.log(`📡 Pinging ${name}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'CashPeek-SEO-Pinger/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok || response.status === 200) {
      console.log(`✅ ${name}: OK (status ${response.status})`);
      return true;
    } else if (response.status === 404) {
      console.log(`⚠️  ${name}: Sitemap not found (404)`);
      return false;
    } else {
      console.log(`⚠️  ${name}: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`⏱️  ${name}: Timeout`);
    } else {
      console.log(`❌ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return false;
  }
}

/**
 * Основная функция пинга
 */
async function pingAll() {
  console.log('🚀 Sitemap Ping Started');
  console.log(`📍 Sitemap URL: ${SITEMAP_URL}`);
  console.log('');

  const results = {
    google: false,
    bing: false,
    yandex: false,
  };

  // Пингуем все поисковые системы параллельно
  const promises = Promise.allSettled([
    pingSearchEngine('Google', PING_URLS.google),
    pingSearchEngine('Bing', PING_URLS.bing),
    pingSearchEngine('Yandex', PING_URLS.yandex),
  ]);

  try {
    const settled = await promises;
    
    results.google = settled[0].status === 'fulfilled' && settled[0].value;
    results.bing = settled[1].status === 'fulfilled' && settled[1].value;
    results.yandex = settled[2].status === 'fulfilled' && settled[2].value;
  } catch (error) {
    console.error('❌ Ping failed:', error);
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`   Google: ${results.google ? '✅' : '❌'}`);
  console.log(`   Bing:   ${results.bing ? '✅' : '❌'}`);
  console.log(`   Yandex: ${results.yandex ? '✅' : '❌'}`);

  const successCount = Object.values(results).filter(Boolean).length;
  console.log('');
  console.log(`🏁 Ping complete: ${successCount}/3 successful`);

  // Логируем результат
  const logMessage = `[${new Date().toISOString()}] Sitemap ping: Google=${results.google}, Bing=${results.bing}, Yandex=${results.yandex}`;
  console.log('');
  console.log(logMessage);

  return results;
}

// Запускаем если скрипт вызван напрямую
if (require.main === module) {
  pingAll()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { pingAll, PING_URLS };
