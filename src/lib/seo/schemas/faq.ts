/**
 * FAQPage Schema.org generator
 * https://schema.org/FAQPage
 */

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Очищает HTML-теги из текста для Schema.org
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Удаляем HTML-теги
    .replace(/\s+/g, ' ') // Нормализуем пробелы
    .trim();
}

export function createFAQSchema(items: FAQItem[]): object | null {
  if (!items || items.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: cleanHtml(item.answer),
      },
    })),
  };
}

/**
 * FAQ для категории займов
 */
export function createCategoryFAQSchema(
  categoryName: string,
  categoryPrepositional: string
): object {
  const items: FAQItem[] = [
    {
      question: `Как получить ${categoryPrepositional}?`,
      answer: `Для получения ${categoryPrepositional} выберите подходящее предложение на нашем сайте, перейдите на сайт МФО и заполните онлайн-заявку. Решение обычно приходит за 5-15 минут, деньги зачисляются на карту мгновенно.`,
    },
    {
      question: 'Какие документы нужны для займа?',
      answer: 'Для оформления займа нужен только паспорт гражданина РФ. Некоторые МФО могут запросить СНИЛС или ИНН для подтверждения личности. Справки о доходах не требуются.',
    },
    {
      question: 'Можно ли получить займ с плохой кредитной историей?',
      answer: 'Да, многие МФО выдают займы клиентам с любой кредитной историей. Укажите в заявке достоверные данные и выберите МФО с высоким процентом одобрения.',
    },
    {
      question: 'Сколько времени занимает оформление?',
      answer: 'Оформление заявки занимает 5-10 минут. Рассмотрение — от 1 до 15 минут в зависимости от МФО. Зачисление денег на карту — мгновенно после одобрения.',
    },
  ];

  return createFAQSchema(items)!;
}

/**
 * FAQ для города
 */
export function createCityFAQSchema(cityName: string, cityPreposition: string): object {
  const items: FAQItem[] = [
    {
      question: `Можно ли получить займ ${cityPreposition} онлайн?`,
      answer: `Да, все займы ${cityPreposition} оформляются онлайн без визита в офис. Выберите МФО, заполните заявку и получите деньги на карту, не выходя из дома.`,
    },
    {
      question: `Работают ли МФО ${cityPreposition} круглосуточно?`,
      answer: `Большинство МФО ${cityPreposition} работают 24/7. Вы можете подать заявку в любое время дня и ночи, в выходные и праздники.`,
    },
    {
      question: 'Как быстро придут деньги на карту?',
      answer: 'После одобрения заявки деньги зачисляются на карту мгновенно или в течение 1-5 минут. В редких случаях перевод может занять до нескольких часов.',
    },
    {
      question: 'Можно ли погасить займ досрочно?',
      answer: 'Да, погасить займ досрочно можно в любой момент без штрафов и комиссий. При досрочном погашении вы платите проценты только за фактические дни использования займа.',
    },
  ];

  return createFAQSchema(items)!;
}
