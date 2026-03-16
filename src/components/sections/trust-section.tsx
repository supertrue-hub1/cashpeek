import * as React from 'react';
import { Shield, FileCheck, Clock, Users, Lock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustSectionProps {
  className?: string;
}

const trustItems = [
  {
    icon: Shield,
    title: 'Проверенные МФО',
    description: 'Все компании имеют лицензию ЦБ РФ и работают по законодательству',
  },
  {
    icon: FileCheck,
    title: 'Честные условия',
    description: 'Указываем реальные ставки. Никаких скрытых комиссий',
  },
  {
    icon: Clock,
    title: 'Быстрое решение',
    description: 'Среднее время от заявки до денег на карте — 15 минут',
  },
  {
    icon: Users,
    title: 'Реальные отзывы',
    description: 'Собираем и анализируем отзывы заёмщиков для объективной оценки',
  },
  {
    icon: Lock,
    title: 'Безопасность данных',
    description: 'Ваши данные защищены. Мы не храним платёжную информацию',
  },
  {
    icon: Award,
    title: 'Рейтинг доверия',
    description: 'Формируем рейтинг на основе 10+ параметров качества',
  },
];

export function TrustSection({ className }: TrustSectionProps) {
  return (
    <section className={cn('py-12 sm:py-16', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Почему нам доверяют</h2>
          <p className="text-muted-foreground">Мы работаем честно и прозрачно</p>
        </div>

        {/* Trust items */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={cn(
                  'flex gap-4 rounded-2xl border border-border bg-card p-5',
                  'transition-all duration-300 hover:shadow-md hover:border-primary/20'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-sm text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
