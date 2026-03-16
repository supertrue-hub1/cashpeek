/**
 * Скрипт создания администратора
 * Запуск: npx tsx .zscripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n🔐 Создание администратора\n');

  // Запрашиваем данные
  const email = await question('Email: ');
  const password = await question('Пароль: ');
  const name = await question('Имя (необязательно): ');

  if (!email || !password) {
    console.error('❌ Email и пароль обязательны');
    process.exit(1);
  }

  // Проверяем, существует ли пользователь
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    // Обновляем роль на admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'admin',
        name: name || existing.name,
      },
    });

    console.log(`\n✅ Пользователь обновлён до admin:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Роль: ${user.role}`);
  } else {
    // Создаём нового админа
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'admin',
      },
    });

    console.log(`\n✅ Администратор создан:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Роль: ${user.role}`);
  }

  console.log('\n🌐 Вход: https://ваш-домен/login');
  console.log('📁 Админка: https://ваш-домен/admin\n');

  rl.close();
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
