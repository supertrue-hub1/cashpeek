/**
 * Скрипт создания администратора с фиксированными данными
 * Запуск: npx tsx .zscripts/create-admin-fixed.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@cashpeek.ru';
const ADMIN_PASSWORD = '546815hH';
const ADMIN_NAME = 'Administrator';

async function main() {
  console.log('\n🔐 Создание администратора\n');
  console.log(`Email: ${ADMIN_EMAIL}`);

  // Проверяем, существует ли пользователь
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existing) {
    // Обновляем роль на admin
    const user = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        password: hashedPassword,
        role: 'admin',
        name: ADMIN_NAME,
      },
    });

    console.log(`\n✅ Пользователь обновлён:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Роль: ${user.role}`);
  } else {
    // Создаём нового админа
    const user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: ADMIN_NAME,
        role: 'admin',
      },
    });

    console.log(`\n✅ Администратор создан:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Роль: ${user.role}`);
  }

  console.log('\n🌐 Вход: /login');
  console.log('📁 Админка: /admin\n');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
