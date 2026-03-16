/**
 * SEO Text Templates
 * Шаблоны для генерации SEO-контента
 */

export interface TextTemplates {
  h1: string;
  title: string;
  description: string;
  shortDescription: string;
  seoText: string;
}

/**
 * Шаблоны для категории займов
 */
export function getCategoryTemplates(
  categoryName: string,
  categoryPrepositional: string,
  shortDesc: string,
  cityName?: string,
  cityPreposition?: string
): TextTemplates {
  const location = cityName ? ` ${cityPreposition}` : '';
  const locationSuffix = cityName ? ` в ${cityName}` : '';

  return {
    h1: `${categoryName}${location} — ${shortDesc}`,
    title: `${categoryName}${location} — сравнить условия и ставки онлайн`,
    description: `${categoryName}${locationSuffix}. ${shortDesc}. Сравните предложения от проверенных МФО, выберите лучший займ за 5 минут.`,
    shortDescription: `${categoryName} онлайн${locationSuffix}. Быстрое одобрение.`,
    seoText: generateCategorySeoText(categoryName, categoryPrepositional, cityName, cityPreposition),
  };
}

/**
 * Генерирует SEO-текст для категории
 */
function generateCategorySeoText(
  categoryName: string,
  categoryPrepositional: string,
  cityName?: string,
  cityPreposition?: string
): string {
  const location = cityName ? ` ${cityPreposition}` : '';
  const locationSuffix = cityName ? ` в ${cityName}` : '';

  return `
## ${categoryName}${location} — быстрые деньги на карту

**${categoryName}** — удобный финансовый инструмент для тех, кому срочно нужны деньги. 
Оформление занимает 5-10 минут, а деньги поступают на карту сразу после одобрения${locationSuffix ? ` — доступно жителям ${cityName}` : ''}.

### Как получить ${categoryPrepositional}?

1. **Выберите предложение** — сравните ставки и условия на нашем сайте
2. **Заполните заявку** — перейдите на сайт МФО и укажите данные паспорта
3. **Получите деньги** — после одобрения деньги придут на карту за 1-5 минут

### Требования к заёмщику

- Гражданство РФ
- Возраст от 18 до 75 лет
- Постоянная регистрация${locationSuffix ? ` (не обязательно ${cityPreposition?.toLowerCase()})` : ''}
- Паспорт и банковская карта

### Преимущества онлайн-оформления

- **Без справок** — не нужны документы о доходах
- **Без поручителей** — не нужно искать гаранта
- **24/7** — заявки рассматриваются круглосуточно
- **Мгновенно** — деньги на карте через 5-15 минут после заявки

${locationSuffix ? `### Займы ${cityPreposition}\n\nЖители ${cityName} могут получить займ на любую банковскую карту. Не обязательно быть прописанным в городе — достаточно регистрации на территории РФ.\n` : ''}
`.trim();
}

/**
 * Шаблоны для МФО
 */
export function getMfoTemplates(
  mfoName: string,
  minAmount: number,
  maxAmount: number,
  minTerm: number,
  maxTerm: number,
  baseRate: number
): TextTemplates {
  return {
    h1: `${mfoName} — официальный сайт, условия займа и отзывы`,
    title: `${mfoName} — займы онлайн, ставки и условия | Отзывы клиентов`,
    description: `Займы в ${mfoName}: от ${minAmount.toLocaleString('ru-RU')} до ${maxAmount.toLocaleString('ru-RU')} ₽ на срок от ${minTerm} до ${maxTerm} дней. Ставка от ${baseRate}% в день. Официальный сайт, отзывы, условия.`,
    shortDescription: `Займы в ${mfoName} от ${baseRate}% в день`,
    seoText: generateMfoSeoText(mfoName, minAmount, maxAmount, minTerm, maxTerm, baseRate),
  };
}

/**
 * Генерирует SEO-текст для МФО
 */
function generateMfoSeoText(
  mfoName: string,
  minAmount: number,
  maxAmount: number,
  minTerm: number,
  maxTerm: number,
  baseRate: number
): string {
  return `
## ${mfoName} — микрофинансовая организация

**${mfoName}** — сервис онлайн-кредитования, предоставляющий займы на карту без справок и поручителей.

### Условия займа

| Параметр | Значение |
|----------|----------|
| Сумма | от ${minAmount.toLocaleString('ru-RU')} до ${maxAmount.toLocaleString('ru-RU')} ₽ |
| Срок | от ${minTerm} до ${maxTerm} дней |
| Ставка | от ${baseRate}% в день |

### Как оформить займ в ${mfoName}

1. Нажмите кнопку «Получить» на нашем сайте
2. Перейдите на официальный сайт ${mfoName}
3. Заполните онлайн-заявку (5-10 минут)
4. Дождитесь решения (обычно 5-15 минут)
5. Получите деньги на карту

### Преимущества ${mfoName}

- Быстрое рассмотрение заявки
- Минимум документов — только паспорт
- Высокий процент одобрения
- Досрочное погашение без комиссий
`.trim();
}

/**
 * Шаблоны для города
 */
export function getCityTemplates(
  cityName: string,
  cityPreposition: string,
  population?: number
): TextTemplates {
  const popText = population ? ` (${(population / 1000000).toFixed(1)} млн жителей)` : '';

  return {
    h1: `Займы ${cityPreposition} — сравнить онлайн на карту`,
    title: `Займы ${cityPreposition} — взять микрозайм онлайн | ${cityName}`,
    description: `Займы ${cityPreposition} онлайн. Сравните условия МФО, оформите заявку за 5 минут и получите деньги на карту. Работаем круглосуточно.`,
    shortDescription: `Микрозаймы ${cityPreposition} без отказа`,
    seoText: generateCitySeoText(cityName, cityPreposition, population),
  };
}

/**
 * Генерирует SEO-текст для города
 */
function generateCitySeoText(
  cityName: string,
  cityPreposition: string,
  population?: number
): string {
  const popText = population 
    ? `Население ${cityName} — более ${(population / 1000000).toFixed(1)} млн человек, и многие из них уже воспользовались услугами онлайн-кредитования.`
    : '';

  return `
## Займы ${cityPreposition}

Жители ${cityName} могут получить микрозайм онлайн без визита в офис МФО. 
Достаточно выбрать предложение на нашем сайте, оформить заявку и получить деньги на банковскую карту.

${popText}

### Преимущества онлайн-займов ${cityPreposition}

- **Без визита в офис** — всё оформление через интернет
- **Круглосуточно** — заявки рассматриваются 24/7
- **Мгновенно** — деньги на карте через 5-15 минут
- **Без прописки** — регистрация в любом регионе РФ

### Какие займы доступны ${cityPreposition}?

- Займы на карту
- Займы без отказа
- Займы без проверки КИ
- Займы круглосуточно
- Займы под 0% для новых клиентов

### Как получить займ ${cityPreposition}?

1. Выберите подходящее предложение
2. Перейдите на сайт МФО
3. Заполните заявку (паспорт + карта)
4. Получите деньги за 5-15 минут
`.trim();
}
