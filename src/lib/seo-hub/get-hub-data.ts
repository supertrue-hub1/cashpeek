/**
 * Data fetching for SEO Hub Pages
 * Server-side функции для получения данных
 */

import { db } from '@/lib/db';
import type { HubPageData, CategoryInfo, CityInfo, OfferData, FaqItem, RelatedLink, SeoData } from './types';
import { LOAN_CATEGORIES, CITIES } from '@/lib/seo/slugs';

// ============================================
// Главная функция получения данных
// ============================================

export async function getHubPageData(
  categorySlug: string,
  citySlug: string
): Promise<HubPageData | null> {
  // Получаем информацию о категории и городе
  const category = getCategoryInfo(categorySlug);
  const city = getCityInfo(citySlug);
  
  if (!category || !city) {
    return null;
  }
  
  // Получаем офферы из БД
  const { offers, isFallback } = await getOffersFromDB(categorySlug);
  
  // Генерируем SEO данные
  const seo = generateSeoData(category, city);
  
  // Генерируем FAQ
  const faqs = generateFaqs(category, city);
  
  // Генерируем связанные ссылки
  const relatedCities = generateRelatedCities(citySlug, categorySlug);
  const relatedCategories = generateRelatedCategories(citySlug, categorySlug);
  
  return {
    category,
    city,
    offers,
    offersCount: offers.length,
    isFallback,
    seo,
    faqs,
    relatedCities,
    relatedCategories,
  };
}

// ============================================
// Получение информации о категории
// ============================================

function getCategoryInfo(slug: string): CategoryInfo | null {
  const category = LOAN_CATEGORIES[slug as keyof typeof LOAN_CATEGORIES];
  
  if (!category) {
    return null;
  }
  
  return {
    slug,
    name: category.name,
    namePrepositional: category.namePrepositional,
    description: category.description,
    h1: category.h1,
    shortDesc: category.shortDesc,
    keywords: category.keywords,
  };
}

// ============================================
// Получение информации о городе
// ============================================

function getCityInfo(slug: string): CityInfo | null {
  const city = CITIES[slug as keyof typeof CITIES];
  
  if (!city) {
    return null;
  }
  
  return {
    slug,
    name: city.name,
    preposition: city.preposition,
    genitive: city.genitive,
    population: city.population,
  };
}

// ============================================
// Получение офферов из БД
// ============================================

async function getOffersFromDB(
  categorySlug: string
): Promise<{ offers: OfferData[]; isFallback: boolean }> {
  try {
    // Маппинг категории на теги
    const tagMapping: Record<string, string[]> = {
      'na-kartu': ['na-kartu', 'to-card'],
      'bez-otkaza': ['bez-otkaza', 'high-approval'],
      'bez-proverki-ki': ['bez-proverki-ki', 'bad-credit-ok'],
      'bez-procentov': ['bez-procentov', 'first-loan-zero'],
      'onlain': ['onlain', 'online-approval'],
      'kruglosutochno': ['kruglosutochno', '24-7'],
      'dlya-pensionerov': ['dlya-pensionerov', 'for-pensioners'],
      'bez-raboty': ['bez-raboty', 'no-job'],
      'studentam': ['studentam', 'for-students'],
      'na-dlitelnyy-srok': ['na-dlitelnyy-srok', 'long-term'],
    };
    
    const tags = tagMapping[categorySlug] || [];
    
    // Строим запрос
    const whereClause: any = {
      status: 'published',
      showOnHomepage: true,
    };
    
    if (tags.length > 0) {
      whereClause.tags = {
        some: {
          tag: {
            slug: { in: tags },
          },
        },
      };
    }
    
    // Получаем офферы
    let offers = await db.loanOffer.findMany({
      where: whereClause,
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { approvalRate: 'desc' },
      ],
      take: 20,
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
    
    let isFallback = false;
    
    // Fallback: если офферов мало, получаем все
    if (offers.length < 5) {
      offers = await db.loanOffer.findMany({
        where: {
          status: 'published',
          showOnHomepage: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { rating: 'desc' },
        ],
        take: 20,
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });
      isFallback = true;
    }
    
    // Форматируем офферы
    const formattedOffers = offers.map(formatOffer);
    
    return { offers: formattedOffers, isFallback };
  } catch (error) {
    console.error('Error fetching offers:', error);
    return { offers: [], isFallback: true };
  }
}

// ============================================
// Форматирование оффера
// ============================================

function formatOffer(offer: any): OfferData {
  const parseJsonArray = (value: unknown): string[] => {
    if (!value) return ['passport'];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : ['passport'];
      } catch {
        return ['passport'];
      }
    }
    return ['passport'];
  };
  
  const slugToFeature: Record<string, string> = {
    'first-loan-zero': 'first_loan_zero',
    'no-overpayments': 'no_overpayments',
    'prolongation': 'prolongation',
    'early-repayment': 'early_repayment',
    'no-hidden-fees': 'no_hidden_fees',
    'online-approval': 'online_approval',
    'one-document': 'one_document',
    'loyalty-program': 'loyalty_program',
  };
  
  return {
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    logo: offer.logo || undefined,
    rating: offer.rating,
    minAmount: offer.minAmount,
    maxAmount: offer.maxAmount,
    minTerm: offer.minTerm || 1,
    maxTerm: offer.maxTerm || 30,
    baseRate: offer.baseRate || 0.8,
    firstLoanRate: offer.firstLoanRate ?? undefined,
    decisionTime: offer.decisionTime || 15,
    approvalRate: offer.approvalRate || 85,
    features: offer.tags?.map((t: any) => slugToFeature[t.tag.slug]).filter(Boolean) || ['online_approval'],
    payoutMethods: parseJsonArray(offer.payoutMethods),
    badCreditOk: offer.badCreditOk ?? false,
    noCalls: offer.noCalls ?? false,
    roundTheClock: offer.roundTheClock ?? false,
    minAge: offer.minAge || 18,
    documents: parseJsonArray(offer.documents),
    editorNote: offer.customDescription || undefined,
    affiliateUrl: offer.affiliateUrl || '#',
    isFeatured: offer.isFeatured ?? false,
    isNew: offer.isNew ?? false,
    isPopular: offer.isPopular ?? false,
  };
}

// ============================================
// Генерация SEO данных
// ============================================

function generateSeoData(category: CategoryInfo, city: CityInfo): SeoData {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';
  
  return {
    title: `${category.name} ${city.preposition} — сравнить ${category.shortDesc.toLowerCase()}`,
    description: `${category.description} ${category.shortDesc} ${city.preposition}. Сравните ${category.namePrepositional} от ${city.genitive}.`,
    h1: `${category.name} ${city.preposition}`,
    canonical: `${BASE_URL}/zaimy/${category.slug}/v-${city.slug}`,
    keywords: [...category.keywords, city.name, `займ ${city.preposition}`],
  };
}

// ============================================
// Генерация FAQ
// ============================================

function generateFaqs(category: CategoryInfo, city: CityInfo): FaqItem[] {
  // FAQ специфичные для категории
  const categoryFaqs: Record<string, FaqItem[]> = {
    'na-kartu': [
      {
        question: `Как получить займ на карту ${city.preposition}?`,
        answer: 'Выберите предложение с выдачей на карту, заполните заявку на сайте МФО, укажите данные карты. Деньги поступят за 5-15 минут.',
      },
      {
        question: 'Какую карту нужно иметь?',
        answer: 'Подойдёт любая дебетовая карта Visa, MasterCard или МИР. Карта должна быть именной и принадлежать вам.',
      },
      {
        question: 'Почему могут отказать в займе на карту?',
        answer: 'Основные причины: недействительная карта, карта другого человека, просрочки по другим займам, неверные данные в заявке.',
      },
    ],
    'bez-otkaza': [
      {
        question: 'Гарантирован ли займ без отказа?',
        answer: 'Ни одна МФО не даёт 100% гарантии. Но мы подобрали МФО с высоким процентом одобрения — до 95%.',
      },
      {
        question: 'Как повысить шансы на одобрение?',
        answer: 'Заполняйте анкету максимально точно, указывайте стабильный доход и работающий телефон. Первый займ берите на небольшую сумму.',
      },
      {
        question: 'Займ без отказа с плохой КИ — возможно?',
        answer: 'Да, многие МФО одобряют займы клиентам с плохой кредитной историей. Процент одобрения ниже, но шансы есть.',
      },
    ],
    'bez-procentov': [
      {
        question: 'Правда ли, что первый займ под 0%?',
        answer: 'Да, большинство МФО дают первый займ под 0% для новых клиентов. Главное — погасить его вовремя, чтобы не начислили проценты.',
      },
      {
        question: 'Сколько можно взять в займ под 0%?',
        answer: 'Обычно до 15 000 ₽ на срок до 30 дней. Для постоянных клиентов лимиты увеличиваются.',
      },
      {
        question: 'Как получить займ под 0% повторно?',
        answer: 'Некоторые МФО возвращают 0% при каждом погашении предыдущего займа в срок. Активные клиенты получают бонусы.',
      },
    ],
    'bez-proverki-ki': [
      {
        question: 'Реально ли получить займ без проверки КИ?',
        answer: 'МФО проверяют кредитную историю, но лояльно относятся к просрочкам. «Без проверки» обычно означает «с плохой КИ».',
      },
      {
        question: 'Как МФО проверяют кредитную историю?',
        answer: 'Через бюро кредитных историй (БКИ). Основные — это БКИА, Эквифакс и ОКБ. Проверка занимает 1-2 минуты.',
      },
      {
        question: 'Если были просрочки — дадут займ?',
        answer: 'Зависит от давности и суммы просрочек. Недавние крупные просрочки — причина отказа. Старые мелкие — могут одобрить.',
      },
    ],
    'onlain': [
      {
        question: 'Как оформить займ онлайн?',
        answer: 'Выберите МФО, заполните заявку на сайте, дождитесь решения, подпишите договор кодом из СМС. Деньги придут на карту.',
      },
      {
        question: 'Сколько времени занимает онлайн-заявка?',
        answer: 'Заполнение заявки — 3-5 минут. Решение — от 2 минут до 1 часа. Большинство МФО принимают решение за 5-15 минут.',
      },
      {
        question: 'Можно ли оформить займ без телефона?',
        answer: 'Нет, телефон обязателен — на него приходит СМС с кодом подтверждения и информация о решении.',
      },
    ],
    'kruglosutochno': [
      {
        question: 'Можно ли получить займ ночью?',
        answer: 'Да, многие МФО работают 24/7. Ночные заявки обрабатываются, хотя в редких случаях возможна задержка до утра.',
      },
      {
        question: 'Когда придут деньги ночью?',
        answer: 'На карту — мгновенно. Наличными через системы переводов — зависит от графика работы пунктов выдачи.',
      },
    ],
    'dlya-pensionerov': [
      {
        question: 'Дают ли займы пенсионерам?',
        answer: 'Да, многие МФО выдают займы пенсионерам до 75-80 лет. Требуется только паспорт и пенсионное удостоверение.',
      },
      {
        question: 'Какой максимальный возраст для займа?',
        answer: 'У разных МФО — от 70 до 80 лет на момент погашения. Уточняйте при выборе предложения.',
      },
    ],
  };
  
  // Базовые FAQ (общие для всех категорий)
  const baseFaqs: FaqItem[] = [
    {
      question: `Как получить ${category.namePrepositional} ${city.preposition}?`,
      answer: `Для получения ${category.namePrepositional} ${city.preposition} выберите подходящее предложение на нашем сайте, перейдите на сайт МФО и заполните онлайн-заявку. Деньги поступят на карту за 5-15 минут.`,
    },
    {
      question: `Какие документы нужны для ${category.namePrepositional}?`,
      answer: 'Для оформления займа нужен только паспорт гражданина РФ. Некоторые МФО могут запросить СНИЛС или ИНН.',
    },
    {
      question: `Работают ли МФО ${city.preposition} круглосуточно?`,
      answer: `Да, большинство МФО ${city.preposition} работают 24/7. Вы можете подать заявку в любое время дня и ночи.`,
    },
    {
      question: 'Нужна ли прописка в городе для получения займа?',
      answer: 'Нет, прописка в конкретном городе не требуется. Достаточно гражданства РФ и постоянной регистрации на территории России.',
    },
    {
      question: `Какой процент одобрения ${category.namePrepositional} ${city.preposition}?`,
      answer: `Средний процент одобрения ${category.namePrepositional} составляет 85-95%. МФО лояльно относятся к заёмщикам и одобряют займы даже с плохой кредитной историей.`,
    },
  ];
  
  // Объединяем специфичные + базовые FAQ
  const categorySpecific = categoryFaqs[category.slug] || [];
  return [...categorySpecific, ...baseFaqs].slice(0, 8);
}

// ============================================
// Генерация связанных ссылок
// ============================================

function generateRelatedCities(currentCity: string, categorySlug: string): RelatedLink[] {
  const cities = Object.entries(CITIES)
    .filter(([slug]) => slug !== currentCity)
    .slice(0, 6)
    .map(([slug, data]) => ({
      title: `${data.name}`,
      href: `/zaimy/${categorySlug}/v-${slug}`,
      description: `Займы ${data.preposition}`,
    }));
  
  return cities;
}

function generateRelatedCategories(currentCategory: string, citySlug: string): RelatedLink[] {
  const categories = Object.entries(LOAN_CATEGORIES)
    .filter(([slug]) => slug !== currentCategory)
    .slice(0, 6)
    .map(([slug, data]) => ({
      title: data.name,
      href: `/zaimy/${slug}/v-${citySlug}`,
      description: data.shortDesc,
    }));
  
  return categories;
}
