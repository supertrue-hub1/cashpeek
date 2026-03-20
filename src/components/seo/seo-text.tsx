'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { declineCity, declineLoanType } from '@/lib/seo/declensions';

interface SeoTextProps {
  /** Тип займа */
  loanType?: string;
  /** Название города */
  city?: string;
  /** Кастомный шаблон (если нужна полная кастомизация) */
  template?: string;
  /** Показывать заголовок */
  showTitle?: boolean;
  /** CSS классы */
  className?: string;
}

/**
 * SEO-текст с подстановкой переменных {city} и {type}
 * Автоматически склоняет слова в правильном падеже
 */
export function SeoText({
  loanType,
  city,
  template,
  showTitle = true,
  className,
}: SeoTextProps) {
  // Склоняем названия
  const cityDeclined = city ? declineCity(city) : null;
  const typeDeclined = loanType ? declineLoanType(loanType) : null;

  // Шаблон по умолчанию
  const defaultTemplate = `
    ${city && typeDeclined 
      ? `Ищете **${typeDeclined.accusative} ${cityDeclined?.dative}**? Мы собрали лучшие предложения от проверенных МФО, которые выдают займы ${typeDeclined.prepositional} с моментальным одобрением.`
      : typeDeclined
      ? `Ищете **${typeDeclined.accusative}**? Наш сервис поможет найти лучшие предложения от проверенных микрофинансовых организаций с моментальным одобрением.`
      : 'Нужен срочный займ? Наш сервис поможет найти лучшие предложения от проверенных МФО.'
    }

    ${city && typeDeclined
      ? `Оформить **${typeDeclined.accusative} ${cityDeclined?.dative}** можно онлайн за 5-15 минут. Большинство МФО работают круглосуточно и не требуют справок о доходах. Первый займ во многих компаниях предоставляется под 0% — вы возвращаете только ту сумму, которую взяли.`
      : typeDeclined
      ? `Оформить **${typeDeclined.accusative}** можно онлайн за несколько минут. Многие МФО работают круглосуточно и выдают деньги даже с плохой кредитной историей.`
      : 'Оформить займ можно онлайн за несколько минут. Многие МФО работают круглосуточно и выдают деньги даже с плохой кредитной историей.'
    }

    ${city && typeDeclined
      ? `Сравните условия и выберите **${typeDeclined.accusative} ${cityDeclined?.dative}** с самыми выгодными ставками. Все предложения на странице проверены и обновляются в реальном времени.`
      : typeDeclined
      ? `Сравните условия и выберите займ с самыми выгодными ставками. Все предложения на странице проверены и обновляются в реальном времени.`
      : 'Сравните условия и выберите займ с самыми выгодными ставками. Все предложения на странице проверены и актуальны.'
    }
  `.trim();

  const content = template || defaultTemplate;

  // Простая подстановка переменных (без markdown для избежания парсинга)
  let processedContent = content
    .replace(/{CITY}/g, cityDeclined?.nominative || '')
    .replace(/{CITY_PREP}/g, cityDeclined ? `в ${cityDeclined.prepositional}` : '')
    .replace(/{CITY_GEN}/g, cityDeclined?.genitive || '')
    .replace(/{CITY_DAT}/g, cityDeclined?.dative || '')
    .replace(/{TYPE}/g, typeDeclined?.nominative || '')
    .replace(/{TYPE_PREP}/g, typeDeclined?.prepositional || '')
    .replace(/{TYPE_GEN}/g, typeDeclined?.genitive || '');

  // Убираем двойные переносы строк
  processedContent = processedContent.replace(/\n\n+/g, '\n\n');

  // Разбиваем на абзацы
  const paragraphs = processedContent.split('\n\n');

  return (
    <div className={cn('prose prose-sm max-w-none text-muted-foreground', className)}>
      {showTitle && (
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Получите займ {typeDeclined?.prepositional} {cityDeclined?.dative}
        </h2>
      )}
      
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          // Обрабатываем жирный текст **text**
          const formattedText = paragraph.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={i} className="text-foreground font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          return (
            <p key={index} className="leading-relaxed">
              {formattedText}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default SeoText;
