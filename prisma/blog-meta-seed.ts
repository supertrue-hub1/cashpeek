import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding blog categories and author...');

  // Create categories
  const categories = await Promise.all([
    db.blogCategory.upsert({
      where: { slug: 'finances' },
      update: {},
      create: {
        name: 'Финансы',
        slug: 'finances',
        description: 'Статьи о финансовой грамотности и управлении деньгами',
        color: '#10b981',
        icon: 'TrendingUp',
        sortOrder: 1,
      },
    }),
    db.blogCategory.upsert({
      where: { slug: 'guides' },
      update: {},
      create: {
        name: 'Руководства',
        slug: 'guides',
        description: 'Подробные инструкции и гайды по займам',
        color: '#3b82f6',
        icon: 'BookOpen',
        sortOrder: 2,
      },
    }),
    db.blogCategory.upsert({
      where: { slug: 'safety' },
      update: {},
      create: {
        name: 'Безопасность',
        slug: 'safety',
        description: 'Защита данных и безопасность онлайн-займов',
        color: '#f59e0b',
        icon: 'Shield',
        sortOrder: 3,
      },
    }),
    db.blogCategory.upsert({
      where: { slug: 'credit-history' },
      update: {},
      create: {
        name: 'Кредитная история',
        slug: 'credit-history',
        description: 'Всё о кредитной истории и её улучшении',
        color: '#8b5cf6',
        icon: 'FileText',
        sortOrder: 4,
      },
    }),
    db.blogCategory.upsert({
      where: { slug: 'news' },
      update: {},
      create: {
        name: 'Новости',
        slug: 'news',
        description: 'Новости рынка микрофинансирования',
        color: '#ec4899',
        icon: 'Newspaper',
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create author
  const author = await db.blogAuthor.upsert({
    where: { slug: 'financial-expert' },
    update: {},
    create: {
      name: 'Финансовый эксперт',
      slug: 'financial-expert',
      bio: 'Эксперт в области микрофинансирования с 10-летним опытом. Помогаю разобраться в условиях займов и избежать финансовых ошибок.',
      role: 'Финансовый эксперт',
      socialLinks: JSON.stringify({
        telegram: 'https://t.me/cashpeek',
      }),
    },
  });

  console.log(`✅ Created author: ${author.name}`);

  // Create second author
  const author2 = await db.blogAuthor.upsert({
    where: { slug: 'editor' },
    update: {},
    create: {
      name: 'Редакция CashPeek',
      slug: 'editor',
      bio: 'Коллектив авторов CashPeek, специализирующийся на обзоре МФО и финансовых продуктов.',
      role: 'Редактор',
    },
  });

  console.log(`✅ Created author: ${author2.name}`);

  console.log('✨ Seeding completed!');
  console.log('\nCategories:');
  categories.forEach((cat) => {
    console.log(`  - ${cat.name} (/blog?category=${cat.slug})`);
  });
  console.log('\nAuthors:');
  console.log(`  - ${author.name}`);
  console.log(`  - ${author2.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
