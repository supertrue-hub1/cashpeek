/**
 * Blog Content Utilities
 * Авто-уникализация контента для избежания Thin Content
 */

/**
 * Генерация уникального вступления для статьи блога
 */
export function generateUniqueIntro(params: {
  title: string;
  category?: string;
  cityName?: string;
  readingTime: number;
}): string {
  const { title, category, cityName, readingTime } = params;
  
  const templates = [
    `В этой статье мы подробно разберем тему "${title}". Чтение займёт около ${readingTime} минут.`,
    `Представляем вашему вниманию материал "${title}". Статья рассчитана на ${readingTime} минут чтения.`,
    `Сегодня поговорим о важной теме — ${title.toLowerCase()}. Время чтения: ${readingTime} мин.`,
  ];
  
  let intro = templates[Math.floor(Math.random() * templates.length)];
  
  if (category) {
    const categoryAdditions = [
      ` Эта статья относится к разделу "${category}".`,
      ` Материал из категории "${category}".`,
      ` Рубрика: ${category}.`,
    ];
    intro += categoryAdditions[Math.floor(Math.random() * categoryAdditions.length)];
  }
  
  if (cityName) {
    const cityAdditions = [
      ` Информация актуальна для жителей ${cityName}.`,
      ` Особенности для ${cityName} рассмотрены ниже.`,
      ` Также затронем специфику в ${cityName}.`,
    ];
    intro += cityAdditions[Math.floor(Math.random() * cityAdditions.length)];
  }
  
  return intro;
}

/**
 * Генерация уникального заключения для статьи
 */
export function generateUniqueConclusion(params: {
  title: string;
  category?: string;
  hasOffers: boolean;
}): string {
  const { title, category, hasOffers } = params;
  
  const templates = [
    `Подводя итоги статьи "${title}", можно сказать, что`,
    `В заключение статьи "${title}" отметим, что`,
    `Резюмируя вышесказанное в "${title}",`,
  ];
  
  let conclusion = templates[Math.floor(Math.random() * templates.length)];
  
  const endings = [
    'выбор займа требует внимательного подхода и сравнения нескольких предложений.',
    'важно учитывать все условия договора перед оформлением.',
    'рекомендуется использовать сервисы сравнения для принятия взвешенного решения.',
    'следует внимательно изучить процентную ставку и сроки погашения.',
  ];
  
  conclusion += ' ' + endings[Math.floor(Math.random() * endings.length)];
  
  if (hasOffers) {
    conclusion += ' Воспользуйтесь формой выше, чтобы сравнить актуальные предложения МФО.';
  }
  
  return conclusion;
}

/**
 * Генерация "редакторской заметки" для уникализации
 */
export function generateEditorNote(params: {
  topic: string;
  date?: Date;
}): string {
  const { topic, date = new Date() } = params;
  
  const notes = [
    `Редакция CashPeek регулярно обновляет информацию о ${topic}. Последнее обновление: ${formatDate(date)}.`,
    `Мы следим за изменениями в сфере ${topic} и актуализируем статьи. Проверено: ${formatDate(date)}.`,
    `Информация о ${topic} проверена экспертами CashPeek. Дата проверки: ${formatDate(date)}.`,
  ];
  
  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Генерация ключевых инсайтов статьи
 */
export function generateKeyInsights(content: string): string[] {
  // Простая генерация на основе контента
  const insights: string[] = [];
  
  if (content.includes('процент') || content.includes('ставка')) {
    insights.push('Внимательно изучите процентную ставку перед оформлением');
  }
  
  if (content.includes('срок') || content.includes('дней')) {
    insights.push('Срок займа влияет на итоговую сумму переплаты');
  }
  
  if (content.includes('карт') || content.includes('перевод')) {
    insights.push('Проверьте, поддерживается ли ваша карта для получения займа');
  }
  
  if (content.includes('КИ') || content.includes('кредитн')) {
    insights.push('При плохой КИ выбирайте МФО без проверки кредитной истории');
  }
  
  // Добавляем дефолтные инсайты если мало
  const defaultInsights = [
    'Сравните несколько предложений перед выбором',
    'Изучите отзывы о МФО на независимых площадках',
    'Проверьте наличие лицензии ЦБ РФ у организации',
  ];
  
  while (insights.length < 3) {
    const defaultInsight = defaultInsights[insights.length];
    if (defaultInsight && !insights.includes(defaultInsight)) {
      insights.push(defaultInsight);
    } else {
      break;
    }
  }
  
  return insights.slice(0, 4);
}

/**
 * Форматирование даты
 */
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('ru-RU', options);
}

/**
 * Генерация "похожих запросов" для блока LSI
 */
export function generateLSIKeywords(mainKeyword: string): string[] {
  const lsiMap: Record<string, string[]> = {
    'займ': ['микрозайм', 'онлайн займ', 'займ на карту', 'срочный займ'],
    'мфо': ['микрофинансовая организация', 'микрокредит', 'займ до зарплаты'],
    'кредит': ['кредитование', 'кредитная ставка', 'банковский кредит'],
    'карта': ['банковская карта', 'карта миг', 'visa mastercard'],
  };
  
  const keywords: string[] = [];
  
  Object.entries(lsiMap).forEach(([key, values]) => {
    if (mainKeyword.toLowerCase().includes(key)) {
      keywords.push(...values);
    }
  });
  
  return [...new Set(keywords)].slice(0, 5);
}
