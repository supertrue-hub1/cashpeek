'use client';

import * as React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  RefreshCw,
  CreditCard,
  PhoneOff,
  Zap,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoanQuiz from '@/components/LoanQuiz';

interface HeroSectionProps {
  className?: string;
}

const MICRO_BENEFITS = [
  { icon: CreditCard, value: '8+', label: 'предложений' },
  { icon: Clock, value: '~5 мин', label: 'решение' },
  { icon: RefreshCw, value: 'ежедневно', label: 'обновление' },
];

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn('relative overflow-hidden py-10 sm:py-14', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-center">
          
          {/* ===== ЛЕВАЯ КОЛОНКА ===== */}
          <div className="order-2 lg:order-1">
            {/* Eyebrow */}
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Сравнение микрофинансовых организаций
              </span>
            </div>

            {/* H1 */}
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight">
              Займы онлайн на карту —{' '}
              <span className="text-primary">выберите лучший вариант</span>
            </h1>

            {/* Подзаголовок */}
            <p className="mb-5 text-sm text-muted-foreground sm:text-base lg:mb-6">
              Сравните условия проверенных МФО и найдите займ с минимальной ставкой. 
              Первый займ под 0% для новых клиентов.
            </p>

            {/* Быстрые теги */}
            <div className="mb-5 flex flex-wrap gap-2 lg:mb-6">
              {[
                { id: 'card', label: 'На карту', icon: CreditCard },
                { id: 'zero', label: 'Первый займ 0%', icon: Zap },
                { id: 'urgent', label: 'Срочно', icon: Clock },
                { id: 'bad-credit', label: 'С плохой КИ', icon: ShieldCheck },
              ].map((tag) => {
                const Icon = tag.icon;
                return (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="gap-1 px-2.5 py-1 text-xs font-medium cursor-pointer bg-muted text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary border-0"
                  >
                    <Icon className="h-3 w-3" />
                    {tag.label}
                  </Badge>
                );
              })}
            </div>

            {/* Микро-преимущества */}
            <div className="flex flex-wrap gap-4">
              {MICRO_BENEFITS.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border shadow-sm">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{benefit.value}</div>
                      <div className="text-xs text-muted-foreground">{benefit.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== ПРАВАЯ КОЛОНКА - КВИЗ ===== */}
          <div className="order-1 lg:order-2" id="calculator">
            <LoanQuiz />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />
    </section>
  );
}
