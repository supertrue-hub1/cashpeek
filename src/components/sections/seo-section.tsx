import * as React from 'react';
import { cn } from '@/lib/utils';

interface SEOSectionProps {
  className?: string;
}

export function SEOSection({ className }: SEOSectionProps) {
  return (
    <section className={cn('py-12 sm:py-16', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            Как выбрать и получить займ онлайн
          </h2>
          
          <div className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              Онлайн-займы — удобный способ быстро получить деньги на карту без 
              справок и поручителей. На сайте собраны проверенные микрофинансовые 
              организации с лицензией ЦБ РФ.
            </p>

            <h3 className="mt-6 text-lg font-semibold text-foreground">Как это работает</h3>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <strong className="text-foreground">Выберите подходящий займ.</strong>{' '}
                Используйте фильтры: сумма, срок, ставка. Для новых клиентов 
                доступны займы под 0% — без переплаты при своевременном возврате.
              </li>
              <li>
                <strong className="text-foreground">Оформите заявку.</strong>{' '}
                Перейдите на сайт МФО и заполните анкету. Понадобится только паспорт.
              </li>
              <li>
                <strong className="text-foreground">Получите деньги.</strong>{' '}
                После одобрения деньги поступят на карту за 1–15 минут.
              </li>
            </ol>

            <h3 className="mt-6 text-lg font-semibold text-foreground">На что обратить внимание</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <strong className="text-foreground">Ставка для первого займа.</strong>{' '}
                Многие МФО предлагают 0% для новых клиентов.
              </li>
              <li>
                <strong className="text-foreground">Время рассмотрения.</strong>{' '}
                Если деньги нужны срочно — выбирайте сервисы с мгновенным решением.
              </li>
              <li>
                <strong className="text-foreground">Возможность пролонгации.</strong>{' '}
                Полезно, если не успеваете вернуть в срок.
              </li>
              <li>
                <strong className="text-foreground">Способы получения.</strong>{' '}
                На карту — быстрее всего. Также доступны наличные и переводы.
              </li>
            </ul>

            <p className="mt-6 text-sm text-muted-foreground/70 italic">
              * Условия займов указаны на сайтах кредиторов. Перед оформлением 
              ознакомьтесь с договором. Микрозаймы доступны лицам старше 18 лет.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
