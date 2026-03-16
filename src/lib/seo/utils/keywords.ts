/**
 * SEO Keywords Generator
 * Автоматическая генерация ключевых слов
 */

import { LOAN_CATEGORIES, CITIES } from '../slugs';

/**
 * Генерирует ключевые слова для категории
 */
export function generateCategoryKeywords(
  categorySlug: string,
  cityName?: string
): string[] {
  const category = LOAN_CATEGORIES[categorySlug as keyof typeof LOAN_CATEGORIES];
  if (!category) return [];

  const keywords: string[] = [...category.keywords];

  if (cityName) {
    keywords.push(
      `${category.namePrepositional} ${cityName}`,
      `займ ${category.namePrepositional.toLowerCase()} ${cityName.toLowerCase()}`,
      `взять займ ${cityName.toLowerCase()}`
    );
  }

  // Добавляем вариации
  keywords.push(
    `${category.name.toLowerCase()}`,
    `оформить ${category.namePrepositional.toLowerCase()}`,
    `получить ${category.namePrepositional.toLowerCase()}`
  );

  return [...new Set(keywords)]; // Уникальные
}

/**
 * Генерирует ключевые слова для МФО
 */
export function generateMfoKeywords(mfoName: string, features: string[] = []): string[] {
  const keywords: string[] = [
    mfoName,
    `${mfoName} займ`,
    `${mfoName} официальный сайт`,
    `${mfoName} онлайн заявка`,
    `займ в ${mfoName}`,
    `отзывы ${mfoName}`,
  ];

  // Добавляем фичи
  if (features.includes('first_loan_zero')) {
    keywords.push(`${mfoName} без процентов`, `${mfoName} 0 процентов`);
  }
  if (features.includes('online_approval')) {
    keywords.push(`${mfoName} онлайн`);
  }

  return keywords;
}

/**
 * Генерирует ключевые слова для города
 */
export function generateCityKeywords(cityName: string, cityPreposition: string): string[] {
  return [
    `займы ${cityPreposition}`,
    `микрозаймы ${cityPreposition}`,
    `мфо ${cityPreposition}`,
    `взять займ ${cityPreposition}`,
    `кредит ${cityPreposition}`,
    `деньги ${cityPreposition}`,
    `займ на карту ${cityPreposition}`,
    `онлайн займ ${cityPreposition}`,
    `срочный займ ${cityPreposition}`,
  ];
}

/**
 * Генерирует LSI-фразы для контента
 */
export function generateLSIPhrases(topic: 'loan' | 'mfo' | 'city'): string[] {
  const phrases: Record<string, string[]> = {
    loan: [
      'микрофинансовая организация',
      'краткосрочный займ',
      'займ до зарплаты',
      'мгновенное решение',
      'без справок',
      'без поручителей',
      'на банковскую карту',
      'онлайн оформление',
      'круглосуточно',
      'без отказа',
    ],
    mfo: [
      'официальный сайт',
      'лицензия цб рф',
      'реестр мфо',
      'процентная ставка',
      'условия займа',
      'досрочное погашение',
      'пролонгация займа',
    ],
    city: [
      'население',
      'регион',
      'доступно онлайн',
      'без посещения офиса',
      'доставка на карту',
    ],
  };

  return phrases[topic] || [];
}
