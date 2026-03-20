/**
 * Склонение слов для SEO-текстов
 * Склоняет названия городов и типов займов
 */

// ============================================
// Типы склонений
// ============================================

export interface Declension {
  /** Именительный падеж (Кто? Что?) */
  nominative: string;
  /** Родительный падеж (Кого? Чего?) */
  genitive: string;
  /** Дательный падеж (Кому? Чему?) */
  dative: string;
  /** Винительный падеж (Кого? Что?) */
  accusative: string;
  /** Предложный падеж (О ком? О чём?) */
  prepositional: string;
}

// ============================================
// Словарь типов займов
// ============================================

const loanTypeDeclensions: Record<string, Declension> = {
  'на карту': {
    nominative: 'на карту',
    genitive: 'на карту',
    dative: 'на карту',
    accusative: 'на карту',
    prepositional: 'на карте',
  },
  'без процентов': {
    nominative: 'без процентов',
    genitive: 'без процентов',
    dative: 'без процентов',
    accusative: 'без процентов',
    prepositional: 'без процентов',
  },
  'без отказа': {
    nominative: 'без отказа',
    genitive: 'без отказа',
    dative: 'без отказа',
    accusative: 'без отказа',
    prepositional: 'без отказа',
  },
  'с плохой кредитной историей': {
    nominative: 'с плохой кредитной историей',
    genitive: 'с плохой кредитной историей',
    dative: 'с плохой кредитной историей',
    accusative: 'с плохой кредитной историей',
    prepositional: 'с плохой кредитной историей',
  },
  'без звонков': {
    nominative: 'без звонков',
    genitive: 'без звонков',
    dative: 'без звонков',
    accusative: 'без звонков',
    prepositional: 'без звонков',
  },
  'круглосуточно': {
    nominative: 'круглосуточно',
    genitive: 'круглосуточно',
    dative: 'круглосуточно',
    accusative: 'круглосуточно',
    prepositional: 'круглосуточно',
  },
  'срочно': {
    nominative: 'срочно',
    genitive: 'срочно',
    dative: 'срочно',
    accusative: 'срочно',
    prepositional: 'срочно',
  },
  'онлайн': {
    nominative: 'онлайн',
    genitive: 'онлайн',
    dative: 'онлайн',
    accusative: 'онлайн',
    prepositional: 'онлайн',
  },
  'наличными': {
    nominative: 'наличными',
    genitive: 'наличных',
    dative: 'наличным',
    accusative: 'наличные',
    prepositional: 'наличных',
  },
  'без справок': {
    nominative: 'без справок',
    genitive: 'без справок',
    dative: 'без справок',
    accusative: 'без справок',
    prepositional: 'без справок',
  },
  'пенсионерам': {
    nominative: 'пенсионерам',
    genitive: 'пенсионерам',
    dative: 'пенсионерам',
    accusative: 'пенсионерам',
    prepositional: 'пенсионерам',
  },
  'студентам': {
    nominative: 'студентам',
    genitive: 'студентам',
    dative: 'студентам',
    accusative: 'студентам',
    prepositional: 'студентам',
  },
  'без проверки кредитной истории': {
    nominative: 'без проверки кредитной истории',
    genitive: 'без проверки кредитной истории',
    dative: 'без проверки кредитной истории',
    accusative: 'без проверки кредитной истории',
    prepositional: 'без проверки кредитной истории',
  },
  'мгновенно': {
    nominative: 'мгновенно',
    genitive: 'мгновенно',
    dative: 'мгновенно',
    accusative: 'мгновенно',
    prepositional: 'мгновенно',
  },
  'по паспорту': {
    nominative: 'по паспорту',
    genitive: 'по паспорту',
    dative: 'по паспорту',
    accusative: 'по паспорту',
    prepositional: 'по паспорту',
  },
  'с доставкой': {
    nominative: 'с доставкой',
    genitive: 'с доставкой',
    dative: 'с доставкой',
    accusative: 'с доставкой',
    prepositional: 'с доставкой',
  },
};

// ============================================
// Словарь крупных городов
// ============================================

const cityDeclensions: Record<string, Declension> = {
  москва: {
    nominative: 'Москва',
    genitive: 'Москвы',
    dative: 'Москве',
    accusative: 'Москву',
    prepositional: 'Москве',
  },
  'москва': {
    nominative: 'Москва',
    genitive: 'Москвы',
    dative: 'Москве',
    accusative: 'Москву',
    prepositional: 'Москве',
  },
  'санкт-петербург': {
    nominative: 'Санкт-Петербург',
    genitive: 'Санкт-Петербурга',
    dative: 'Санкт-Петербурге',
    accusative: 'Санкт-Петербург',
    prepositional: 'Санкт-Петербурге',
  },
  'санкт-петербург': {
    nominative: 'Санкт-Петербург',
    genitive: 'Санкт-Петербурга',
    dative: 'Санкт-Петербурге',
    accusative: 'Санкт-Петербург',
    prepositional: 'Санкт-Петербурге',
  },
  новосибирск: {
    nominative: 'Новосибирск',
    genitive: 'Новосибирска',
    dative: 'Новосибирске',
    accusative: 'Новосибирск',
    prepositional: 'Новосибирске',
  },
  екатеринбург: {
    nominative: 'Екатеринбург',
    genitive: 'Екатеринбурга',
    dative: 'Екатеринбурге',
    accusative: 'Екатеринбург',
    prepositional: 'Екатеринбурге',
  },
  казань: {
    nominative: 'Казань',
    genitive: 'Казани',
    dative: 'Казани',
    accusative: 'Казань',
    prepositional: 'Казани',
  },
  'нижний новгород': {
    nominative: 'Нижний Новгород',
    genitive: 'Нижнего Новгорода',
    dative: 'Нижнем Новгороде',
    accusative: 'Нижний Новгород',
    prepositional: 'Нижнем Новгороде',
  },
  челябинск: {
    nominative: 'Челябинск',
    genitive: 'Челябинска',
    dative: 'Челябинске',
    accusative: 'Челябинск',
    prepositional: 'Челябинске',
  },
  самара: {
    nominative: 'Самара',
    genitive: 'Самары',
    dative: 'Самаре',
    accusative: 'Самару',
    prepositional: 'Самаре',
  },
  омск: {
    nominative: 'Омск',
    genitive: 'Омска',
    dative: 'Омске',
    accusative: 'Омск',
    prepositional: 'Омске',
  },
  'ростов-на-дону': {
    nominative: 'Ростов-на-Дону',
    genitive: 'Ростова-на-Дону',
    dative: 'Ростове-на-Дону',
    accusative: 'Ростов-на-Дону',
    prepositional: 'Ростове-на-Дону',
  },
  уфа: {
    nominative: 'Уфа',
    genitive: 'Уфы',
    dative: 'Уфе',
    accusative: 'Уфу',
    prepositional: 'Уфе',
  },
  красноярск: {
    nominative: 'Красноярск',
    genitive: 'Красноярска',
    dative: 'Красноярске',
    accusative: 'Красноярск',
    prepositional: 'Красноярске',
  },
  пермь: {
    nominative: 'Пермь',
    genitive: 'Перми',
    dative: 'Перми',
    accusative: 'Пермь',
    prepositional: 'Перми',
  },
  воронеж: {
    nominative: 'Воронеж',
    genitive: 'Воронежа',
    dative: 'Воронеже',
    accusative: 'Воронеж',
    prepositional: 'Воронеже',
  },
  волгоград: {
    nominative: 'Волгоград',
    genitive: 'Волгограда',
    dative: 'Волгограде',
    accusative: 'Волгоград',
    prepositional: 'Волгограде',
  },
};

// ============================================
// Генератор склонений для произвольного города
// ============================================

/**
 * Склоняет название города
 * Для неизвестных городов использует упрощённую логику
 */
export function declineCity(cityName: string): Declension {
  const normalized = cityName.toLowerCase().trim();
  
  // Проверяем словарь
  if (cityDeclensions[normalized]) {
    return cityDeclensions[normalized];
  }

  // Для неизвестных городов — простая эвристика
  // Большинство русских городов склоняются одинаково
  const lastChar = cityName.slice(-1);
  const lastTwoChars = cityName.slice(-2);

  // Несклоняемые города (на -и, -ы, -о, -е, -у, -ю, -а, -я в конце)
  const undeclinable = ['и', 'ы', 'о', 'е', 'у', 'ю', 'а', 'я'];
  
  // Проверяем окончание
  if (undeclinable.includes(lastChar) || normalized.includes('бург') || normalized.includes('город')) {
    return {
      nominative: cityName,
      genitive: cityName,
      dative: cityName,
      accusative: cityName,
      prepositional: cityName,
    };
  }

  // Стандартное склонение (для городов на -а, -я)
  if (lastChar === 'а' || lastChar === 'я') {
    const base = lastChar === 'я' ? cityName.slice(0, -1) + 'и' : cityName.slice(0, -1);
    return {
      nominative: cityName,
      genitive: base + 'ы',
      dative: base + 'е',
      accusative: cityName.slice(0, -1) + 'у',
      prepositional: base + 'е',
    };
  }

  // Несклоняемые
  return {
    nominative: cityName,
    genitive: cityName,
    dative: cityName,
    accusative: cityName,
    prepositional: cityName,
  };
}

/**
 * Склоняет тип займа
 */
export function declineLoanType(typeName: string): Declension {
  const normalized = typeName.toLowerCase().trim();
  
  if (loanTypeDeclensions[normalized]) {
    return loanTypeDeclensions[normalized];
  }

  // Для неизвестных типов — возвращаем как есть
  return {
    nominative: typeName,
    genitive: typeName,
    dative: typeName,
    accusative: typeName,
    prepositional: typeName,
  };
}

/**
 * Форматирует предлог для города
 * "в Москве", "в Казани", "в Новосибирске"
 */
export function formatCityPreposition(cityName: string): string {
  const declined = declineCity(cityName);
  return `в ${declined.prepositional}`;
}

/**
 * Форматирует тип займа для использования в тексте
 */
export function formatLoanType(typeName: string): string {
  const declined = declineLoanType(typeName);
  return declined.accusative;
}

/**
 * Подставляет переменные в SEO-шаблон
 * {CITY} -> Москва
 * {CITY_PREP} -> в Москве
 * {CITY_GEN} -> Москвы
 * {TYPE} -> на карту
 * {TYPE_PREP} -> на карте
 */
export function interpolateSeoText(
  template: string,
  params: {
    city?: string;
    type?: string;
  }
): string {
  let result = template;

  if (params.city) {
    const city = declineCity(params.city);
    result = result.replace(/{CITY}/g, city.nominative);
    result = result.replace(/{CITY_PREP}/g, `в ${city.prepositional}`);
    result = result.replace(/{CITY_GEN}/g, city.genitive);
    result = result.replace(/{CITY_DAT}/g, city.dative);
    result = result.replace(/{CITY_ACC}/g, city.accusative);
  }

  if (params.type) {
    const type = declineLoanType(params.type);
    result = result.replace(/{TYPE}/g, type.nominative);
    result = result.replace(/{TYPE_PREP}/g, type.prepositional);
    result = result.replace(/{TYPE_GEN}/g, type.genitive);
    result = result.replace(/{TYPE_DAT}/g, type.dative);
    result = result.replace(/{TYPE_ACC}/g, type.accusative);
  }

  return result;
}

// ============================================
// Экспорт констант для шаблонов
// ============================================

export const SEO_YEAR = new Date().getFullYear();

export const CTA_PHRASES = [
  'Одобрение онлайн',
  'Быстрый займ за 5 минут',
  'Деньги на карту',
  'Без отказа',
  'Первый займ под 0%',
  'Срочно и безопасно',
];

export const DEFAULT_CTA = 'Одобрение онлайн';
