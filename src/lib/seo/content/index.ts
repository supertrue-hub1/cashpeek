/**
 * SEO Content Generators
 * Динамическая генерация контента для SEO-блоков
 */

import { LOAN_CATEGORIES, CITIES } from '../slugs';

// ============================================
// ТИПЫ
// ============================================

export interface SeoStats {
  offersCount: number;
  avgRating: number;
  avgRate: number;
  zeroPercentCount: number;
  avgDecisionTime: number;
  avgApprovalRate: number;
}

export interface CityStats extends SeoStats {
  cityName: string;
  cityPreposition: string;
  population?: number;
  region?: string;
}

// ============================================
// ГЕНЕРАТОРЫ СТАТИСТИКИ
// ============================================

/**
 * Генерирует статистику для страницы
 */
export function generateStats(offers: {
  rating: number;
  baseRate: number;
  firstLoanRate?: number;
  decisionTime: number;
  approvalRate: number;
}[]): SeoStats {
  if (!offers || offers.length === 0) {
    return {
      offersCount: 0,
      avgRating: 0,
      avgRate: 0.8,
      zeroPercentCount: 0,
      avgDecisionTime: 15,
      avgApprovalRate: 85,
    };
  }

  const sum = offers.reduce(
    (acc, o) => ({
      rating: acc.rating + o.rating,
      rate: acc.rate + o.baseRate,
      decisionTime: acc.decisionTime + o.decisionTime,
      approvalRate: acc.approvalRate + o.approvalRate,
    }),
    { rating: 0, rate: 0, decisionTime: 0, approvalRate: 0 }
  );

  return {
    offersCount: offers.length,
    avgRating: Number((sum.rating / offers.length).toFixed(1)),
    avgRate: Number((sum.rate / offers.length).toFixed(2)),
    zeroPercentCount: offers.filter((o) => o.firstLoanRate === 0).length,
    avgDecisionTime: Math.round(sum.decisionTime / offers.length),
    avgApprovalRate: Math.round(sum.approvalRate / offers.length),
  };
}

/**
 * Форматирует статистику для вывода
 */
export function formatStatsText(stats: SeoStats, cityName?: string): string {
  const location = cityName ? ` в ${cityName}` : '';
  
  return `${stats.offersCount} МФО${location} со средней ставкой ${stats.avgRate}% в день. ` +
    `Средний рейтинг — ${stats.avgRating}/5. ` +
    `${stats.zeroPercentCount} МФО предлагают первый займ под 0%.`;
}

/**
 * Генерирует статистику для города
 */
export function generateCityStats(
  cityName: string,
  citySlug: string,
  offers: SeoStats['offersCount'] extends infer T ? { rating: number; baseRate: number; firstLoanRate?: number; decisionTime: number; approvalRate: number }[] : never
): CityStats {
  const city = CITIES[citySlug as keyof typeof CITIES];
  const baseStats = generateStats(offers);

  return {
    ...baseStats,
    cityName,
    cityPreposition: city?.preposition || `в ${cityName}`,
    population: city?.population,
    region: city ? undefined : undefined, // Можно добавить регион из БД
  };
}

// ============================================
// ГЕНЕРАТОРЫ СОВЕТОВ
// ============================================

export interface SeoTip {
  title: string;
  text: string;
  icon: 'clock' | 'money' | 'doc' | 'card' | 'check';
}

/**
 * Советы для типа займа
 */
export function generateLoanTips(categorySlug?: string): SeoTip[] {
  const baseTips: SeoTip[] = [
    {
      title: 'Подавайте заявку утром',
      text: 'В будни с 9 до 12 часов — максимальная активность МФО и быстрое рассмотрение заявок.',
      icon: 'clock',
    },
    {
      title: 'Указывайте достоверные данные',
      text: 'Совпадение данных паспорта и заявки увеличивает шанс одобрения на 40%.',
      icon: 'doc',
    },
    {
      title: 'Погашайте досрочно',
      text: 'При досрочном погашении вы платите проценты только за фактические дни использования.',
      icon: 'money',
    },
    {
      title: 'Используйте первый займ под 0%',
      text: 'Многие МФО дают первый займ без процентов — возвращайте ровно столько, сколько взяли.',
      icon: 'check',
    },
  ];

  // Дополнительные советы по категориям
  const categoryTips: Record<string, SeoTip[]> = {
    'bez-otkaza': [
      {
        title: 'Подайте в несколько МФО',
        text: 'Одновременная заявка в 2-3 МФО повышает шанс одобрения до 97%.',
        icon: 'check',
      },
    ],
    'bez-proverki-ki': [
      {
        title: 'Выбирайте МФО без проверки БКИ',
        text: 'Такие организации оценивают только текущую платёжеспособность, а не историю.',
        icon: 'doc',
      },
    ],
    'kruglosutochno': [
      {
        title: 'Ночные заявки одобряют быстрее',
        text: 'После 23:00 меньше заявок — система обрабатывает вашу быстрее.',
        icon: 'clock',
      },
    ],
    'dlya-pensionerov': [
      {
        title: 'Укажите пенсию как доход',
        text: 'Пенсия — стабильный доход, который учитывается при оценке заявки.',
        icon: 'money',
      },
    ],
  };

  const extraTips = categorySlug ? categoryTips[categorySlug] || [] : [];
  
  return [...baseTips.slice(0, 3), ...extraTips].slice(0, 4);
}

// ============================================
// ГЕНЕРАТОРЫ ФАКТОВ
// ============================================

export interface SeoFact {
  title: string;
  value: string;
  description: string;
}

/**
 * Факты о микрозаймах
 */
export function generateLoanFacts(): SeoFact[] {
  return [
    {
      title: 'Средняя ставка',
      value: '0.8%',
      description: 'в день — это 292% годовых',
    },
    {
      title: 'Одобрение',
      value: '85%',
      description: 'заявок получают положительное решение',
    },
    {
      title: 'Время решения',
      value: '5-15 мин',
      description: 'среднее время рассмотрения заявки',
    },
    {
      title: 'Возраст заёмщиков',
      value: '18-75 лет',
      description: 'диапазон допустимого возраста',
    },
  ];
}

/**
 * Факты о городе
 */
export function generateCityFacts(citySlug: string): SeoFact[] {
  const city = CITIES[citySlug as keyof typeof CITIES];
  
  if (!city) {
    return generateLoanFacts();
  }

  return [
    {
      title: 'Население',
      value: city.population ? `${(city.population / 1000000).toFixed(1)} млн` : '—',
      description: `жителей ${city.genitive}`,
    },
    {
      title: 'МФО в городе',
      value: '20+',
      description: 'онлайн-кредиторов работают круглосуточно',
    },
    {
      title: 'Среднее одобрение',
      value: '87%',
      description: 'высокий процент для крупных городов',
    },
    {
      title: 'Время выдачи',
      value: '5-15 мин',
      description: 'деньги на карте мгновенно',
    },
  ];
}

// ============================================
// ГЕНЕРАТОРЫ КОНТЕНТА
// ============================================

/**
 * Генерирует SEO-текст для блока статистики
 */
export function generateStatsBlockContent(
  stats: SeoStats,
  cityName?: string,
  categoryPrepositional?: string
): { title: string; text: string; highlight: string } {
  const location = cityName ? ` в ${cityName}` : '';
  const category = categoryPrepositional ? ` ${categoryPrepositional}` : '';

  return {
    title: `Статистика${location}`,
    text: `На сайте представлено ${stats.offersCount} проверенных МФО${location}. ` +
      `Средний рейтинг — ${stats.avgRating}/5, средняя ставка — ${stats.avgRate}% в день.`,
    highlight: `${stats.zeroPercentCount} МФО предлагают ${category} под 0% для новых клиентов`,
  };
}

/**
 * Генерирует текст для блока преимуществ
 */
export function generateBenefitsContent(categorySlug?: string): {
  title: string;
  items: { title: string; description: string }[];
} {
  const baseItems = [
    { title: 'Быстро', description: 'Оформление за 5 минут, деньги на карте через 15' },
    { title: 'Без справок', description: 'Только паспорт — никаких документов о доходах' },
    { title: '24/7', description: 'Заявки рассматриваются круглосуточно и без выходных' },
    { title: 'Без отказа', description: 'Высокий процент одобрения даже с плохой КИ' },
  ];

  const categoryBenefits: Record<string, { title: string; items: { title: string; description: string }[] }> = {
    'bez-procentov': {
      title: 'Преимущества займов под 0%',
      items: [
        { title: '0% переплата', description: 'Возвращаете ровно столько, сколько взяли' },
        { title: 'Для новых клиентов', description: 'Акция действует при первом обращении' },
        { title: 'До 30 000 ₽', description: 'Максимальная сумма под 0%' },
        { title: 'До 30 дней', description: 'Стандартный срок для беспроцентного займа' },
      ],
    },
    'kruglosutochno': {
      title: 'Почему круглосуточно?',
      items: [
        { title: 'Автоматизация', description: 'Роботы рассматривают заявки без участия людей' },
        { title: 'Ночные займы', description: 'После 23:00 заявки обрабатываются быстрее' },
        { title: 'Выходные', description: 'Работаем в субботу, воскресенье и праздники' },
        { title: 'Мгновенно', description: 'Деньги на карте через 1-5 минут после одобрения' },
      ],
    },
  };

  if (categorySlug && categoryBenefits[categorySlug]) {
    return categoryBenefits[categorySlug];
  }

  return {
    title: 'Преимущества онлайн-займов',
    items: baseItems,
  };
}
