/**
 * Генератор фейковых отзывов для МФО
 * Используется для SEO и демонстрации
 */

import type { Review } from '@/types/offer';
import { v4 as uuidv4 } from 'uuid';

// Русские имена для отзывов
const FIRST_NAMES = [
  'Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей', 'Алексей', 'Артём', 'Илья',
  'Анна', 'Елена', 'Мария', 'Ольга', 'Наталья', 'Екатерина', 'Татьяна', 'Ирина',
  'Павел', 'Николай', 'Владимир', 'Игорь', 'Олег', 'Роман', 'Евгений', 'Виктор',
  'Светлана', 'Юлия', 'Анастасия', 'Дарья', 'Виктория', 'Марина', 'Ксения', 'Полина'
];

const LAST_NAMES = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов',
  'Новикова', 'Морозова', 'Волкова', 'Соловьёва', 'Васильева', 'Зайцева', 'Павлова', 'Семёнова'
];

// Шаблоны положительных отзывов
const POSITIVE_TEMPLATES = [
  'Отличный сервис! Деньги пришли за {time} минут. Очень выручили в трудную ситуацию. Рекомендую всем!',
  'Быстрое оформление, вежливые сотрудники. Займ получила уже через {time} минут после подачи заявки. Буду обращаться ещё.',
  'Пользуюсь уже не первый раз. Всегда быстро и без проблем. Проценты адекватные, особенно если возвращать вовремя.',
  'Очень удобно, что всё онлайн. Заявку оформила за 5 минут, деньги пришли практически мгновенно. Спасибо!',
  'Первый раз брала займ под 0%. Вернула вовремя — переплаты не было. Отличная акция для новых клиентов!',
  'Одобрили быстро, несмотря на плохую кредитную историю. Очень благодарна, что дали второй шанс.',
  'Круглосуточная работа — это огромный плюс. Подала заявку ночью, через {time} минут деньги уже были на карте.',
  'Прозрачные условия, нет скрытых комиссий. Всё честно и понятно. Рекомендую!',
  'Удобное продление займа. Когда не успеваю вернуть — продлеваю через личный кабинет за пару кликов.',
  'Отличный сервис! Пользуюсь уже {count} раз. Никогда не было проблем с получением или возвратом.',
  'Очень выручили! Срочно нужны были деньги на лекарства. Займ оформили за {time} минут. Спасибо огромное!',
  'Приятный сюрприз — повторный займ под сниженный процент. Лояльность к постоянным клиентам радует.',
  'Всё чётко и быстро. Без звонков и лишних вопросов. Деньги на карте уже через {time} минут после заявки.',
  'Рекомендую! Особенно удобно, что можно погасить досрочно без штрафов. Переплата минимальная.',
  'Отличная МФО! Пользуюсь периодически, когда нужны небольшие суммы до зарплаты. Всегда выручает.',
];

// Шаблоны нейтральных отзывов
const NEUTRAL_TEMPLATES = [
  'Нормальный сервис. Оформили быстро, но проценты высоковаты. В остальном — без нареканий.',
  'Получила займ без проблем. Условия стандартные для МФО. Если срочно нужны деньги — вариант нормальный.',
  'Всё прошло хорошо, но хотелось бы больше информации на сайте. В остальном — претензий нет.',
  'Займ одобрили быстро. Проценты как у всех. Главное — возвращать вовремя.',
  'Сервис работает корректно. Заявку обработали за {time} минут. Ничего необычного.',
];

// Шаблоны с деталями
const DETAILED_TEMPLATES = [
  'Брал {amount} рублей на {term} дней. Одобрили за {time} минут. Вернул вовремя, переплата составила {overpay} рублей. Нормально.',
  'Оформляла займ в первый раз. Понадобилось {amount} ₽. Всё прошло гладко, деньги пришли на карту Сбера через {time} минут.',
  'Срочно нужны были деньги на ремонт машины. Обратился в {mfo} — не пожалел. Одобрили {amount} рублей за {time} минут.',
  'Пользуюсь услугами {mfo} уже {count} месяцев. Беру обычно на {term} дней под 0%. Очень удобно!',
  'Раньше боялся МФО, но {mfo} pleasantly surprised. Прозрачные условия, быстрое оформление. Берёшь {amount} — отдаёшь ровно столько, сколько указано.',
];

// Время решения (минуты)
const DECISION_TIMES = [1, 2, 3, 5, 7, 10, 15, 20, 30];

// Суммы займов
const LOAN_AMOUNTS = [3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000];

// Сроки займов
const LOAN_TERMS = [5, 7, 10, 14, 15, 21, 30];

// Генерация случайного элемента массива
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Генерация случайного числа в диапазоне
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Генерация случайной даты за последние 90 дней
function randomDate(): string {
  const now = new Date();
  const daysAgo = randomInt(1, 90);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

// Генерация текста отзыва
function generateReviewText(mfoName: string): string {
  const templates = Math.random() > 0.3 
    ? [...POSITIVE_TEMPLATES, ...DETAILED_TEMPLATES]
    : NEUTRAL_TEMPLATES;
  
  let text = randomItem(templates);
  
  // Замена плейсхолдеров
  const time = randomItem(DECISION_TIMES);
  const amount = randomItem(LOAN_AMOUNTS);
  const term = randomItem(LOAN_TERMS);
  const count = randomInt(2, 10);
  const overpay = Math.round(amount * 0.01 * term); // Примерная переплата
  
  text = text.replace('{time}', String(time));
  text = text.replace('{amount}', String(amount));
  text = text.replace('{term}', String(term));
  text = text.replace('{count}', String(count));
  text = text.replace('{overpay}', String(overpay));
  text = text.replace('{mfo}', mfoName);
  
  return text;
}

// Генерация имени автора
function generateAuthorName(): string {
  const firstName = randomItem(FIRST_NAMES);
  const showLastName = Math.random() > 0.5;
  
  if (showLastName) {
    const lastName = randomItem(LAST_NAMES);
    return `${firstName} ${lastName.charAt(0)}.`;
  }
  
  return `${firstName} ${String.fromCharCode(65 + randomInt(0, 25))}.`;
}

// Генерация рейтинга (взвешенный - больше высоких оценок)
function generateRating(): number {
  const weights = [0.05, 0.1, 0.15, 0.25, 0.45]; // 1-5 звёзд
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return i + 1;
    }
  }
  
  return 5;
}

/**
 * Генерирует массив фейковых отзывов для МФО
 * 
 * @param mfoId - ID МФО
 * @param mfoName - Название МФО
 * @param minCount - Минимальное количество отзывов (по умолчанию 1)
 * @param maxCount - Максимальное количество отзывов (по умолчанию 30)
 * @returns Массив отзывов
 */
export function generateFakeReviews(
  mfoId: string,
  mfoName: string,
  minCount: number = 1,
  maxCount: number = 30
): Review[] {
  const count = randomInt(minCount, maxCount);
  const reviews: Review[] = [];
  
  for (let i = 0; i < count; i++) {
    const rating = generateRating();
    const helpful = rating >= 4 ? randomInt(5, 50) : randomInt(1, 15);
    
    reviews.push({
      id: uuidv4(),
      offerId: mfoId,
      author: generateAuthorName(),
      rating,
      date: randomDate(),
      text: generateReviewText(mfoName),
      verified: Math.random() > 0.3, // 70% проверенных
      helpful,
      source: 'server', // Помечаем как серверные (для SEO)
      likedBy: [],
    });
  }
  
  // Сортируем по дате (новые первыми)
  return reviews.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Генерирует детальную статистику отзывов
 */
export function generateReviewStats(reviews: Review[]) {
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  
  reviews.forEach(r => {
    distribution[r.rating as keyof typeof distribution]++;
    sum += r.rating;
  });
  
  return {
    average: Number((sum / reviews.length).toFixed(1)),
    total: reviews.length,
    distribution,
  };
}
