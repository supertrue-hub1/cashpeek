#!/usr/bin/env tsx

/**
 * Скрипт для тестирования Health Check системы
 * Запуск: npx tsx scripts/test-health-check.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testHealthCheck() {
  console.log('🧪 Testing Health Check System...\n');

  try {
    // 1. Проверка статуса
    console.log('1️⃣  Testing /api/health/status...');
    const statusRes = await fetch(`${BASE_URL}/api/health/status`);
    const statusData = await statusRes.json();
    
    if (statusData.success) {
      console.log('   ✅ Status API works');
      console.log(`   📊 System status: ${statusData.status.systemStatus}`);
      console.log(`   📈 Pages: ${statusData.status.stats.total}`);
    } else {
      console.log('   ❌ Status API failed');
    }

    // 2. Проверка списка страниц
    console.log('\n2️⃣  Testing /api/health/pages...');
    const pagesRes = await fetch(`${BASE_URL}/api/health/pages`);
    const pagesData = await pagesRes.json();
    
    if (pagesData.success) {
      console.log('   ✅ Pages API works');
      console.log(`   📄 Total pages: ${pagesData.pages.length}`);
      
      if (pagesData.pages.length > 0) {
        console.log('   📋 First page:', pagesData.pages[0].name);
      }
    } else {
      console.log('   ❌ Pages API failed');
    }

    // 3. Проверка чата
    console.log('\n3️⃣  Testing /api/health/chat...');
    const chatRes = await fetch(`${BASE_URL}/api/health/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'статус' })
    });
    const chatData = await chatRes.json();
    
    if (chatData.success) {
      console.log('   ✅ Chat API works');
      console.log('   🤖 Response preview:', chatData.response.substring(0, 100) + '...');
    } else {
      console.log('   ❌ Chat API failed');
    }

    // 4. Проверка инцидентов
    console.log('\n4️⃣  Testing /api/health/incidents...');
    const incidentsRes = await fetch(`${BASE_URL}/api/health/incidents`);
    const incidentsData = await incidentsRes.json();
    
    if (incidentsData.success) {
      console.log('   ✅ Incidents API works');
      console.log(`   🚨 Total incidents: ${incidentsData.incidents.length}`);
    } else {
      console.log('   ❌ Incidents API failed');
    }

    console.log('\n✅ Health Check System test complete!\n');
    
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run db:push');
    console.log('   2. Run: npx tsx src/lib/health-check-init.ts');
    console.log('   3. Open: http://localhost:3000/admin/health\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.log('\n💡 Make sure:');
    console.log('   1. Database is running');
    console.log('   2. Migrations are applied: npm run db:push');
    console.log('   3. Dev server is running: npm run dev\n');
  }
}

testHealthCheck();
