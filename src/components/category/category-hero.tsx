'use client';

import * as React from 'react';
import { Calculator, ArrowRight, Sparkles, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import type { CategoryConfig } from '@/lib/category/category-config';

interface CategoryHeroProps {
  config: CategoryConfig;
  offersCount: number;
  onApplyFilters?: (filters: { amount: number; term: number }) => void;
}

export function CategoryHero({ config, offersCount, onApplyFilters }: CategoryHeroProps) {
  const [mounted, setMounted] = React.useState(false);
  const [amount, setAmount] = React.useState(15000);
  const [term, setTerm] = React.useState(14);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const handleShowOffers = () => {
    onApplyFilters?.({ amount, term });
    const offersSection = document.getElementById('offers');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Расчёт переплаты (0.8% в день)
  const dailyRate = 0.008;
  const overpayment = Math.round(amount * dailyRate * term);
  const totalRepayment = amount + overpayment;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted to-background border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="py-8 sm:py-10 lg:py-12">
          <div className="grid gap-6 lg:grid-cols-5 lg:gap-8 lg:items-center">
            
            {/* Левая колонка — контент */}
            <div className="lg:col-span-3">
              {/* Breadcrumbs-подобная строка */}
              <div className="mb-4 flex items-center gap-2 text-sm">
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Главная
                </a>
                <span className="text-muted-foreground/50">/</span>
                <a href="/zaimy" className="text-muted-foreground hover:text-primary transition-colors">
                  Займы
                </a>
                <span className="text-muted-foreground/50">/</span>
                <span className="text-foreground font-medium">{config.name}</span>
              </div>

              {/* H1 */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">
                {config.h1}
              </h1>

              {/* Подзаголовок */}
              <p className="text-muted-foreground text-sm sm:text-base mb-5 max-w-2xl">
                {config.subtitle}
              </p>

              {/* Быстрые теги */}
              <div className="flex flex-wrap gap-2 mb-5">
                <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-0">
                  <Sparkles className="h-3 w-3" />
                  {offersCount} предложений
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
                  <Clock className="h-3 w-3" />
                  За 5 минут
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-0">
                  <Shield className="h-3 w-3" />
                  Без справок
                </Badge>
              </div>

              {/* Мини-статистика */}
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    1 000–100 000 ₽
                  </div>
                  <div className="text-xs text-muted-foreground">Сумма</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    1–365 дней
                  </div>
                  <div className="text-xs text-muted-foreground">Срок</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    от 0%
                  </div>
                  <div className="text-xs text-muted-foreground">Ставка</div>
                </div>
              </div>
            </div>

            {/* Правая колонка — мини-калькулятор */}
            <div className="lg:col-span-2">
              <Card className="border-border shadow-lg bg-background">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      Рассчитайте займ
                    </span>
                  </div>

                  {/* Сумма */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Сумма</span>
                      <span className="text-sm font-bold text-primary">
                        {formatAmount(amount)} ₽
                      </span>
                    </div>
                    {mounted && (
                      <Slider
                        value={[amount]}
                        min={1000}
                        max={100000}
                        step={1000}
                        onValueChange={([v]) => setAmount(v)}
                        className="py-2"
                      />
                    )}
                    {!mounted && (
                      <div className="h-5 bg-muted rounded-full" />
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 000 ₽</span>
                      <span>100 000 ₽</span>
                    </div>
                  </div>

                  {/* Срок */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Срок</span>
                      <span className="text-sm font-bold text-primary">
                        {term} {term === 1 ? 'день' : term < 5 ? 'дня' : 'дней'}
                      </span>
                    </div>
                    {mounted && (
                      <Slider
                        value={[term]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={([v]) => setTerm(v)}
                        className="py-2"
                      />
                    )}
                    {!mounted && (
                      <div className="h-5 bg-muted rounded-full" />
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 день</span>
                      <span>30 дней</span>
                    </div>
                  </div>

                  {/* Результат */}
                  <div className="rounded-lg bg-muted p-3 mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">К возврату:</span>
                      <span className="font-bold text-foreground">{formatAmount(totalRepayment)} ₽</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Переплата:</span>
                      <span className="font-medium text-primary">{formatAmount(overpayment)} ₽</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleShowOffers}
                    className="w-full h-10"
                  >
                    Показать предложения
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Декоративный фон */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-3xl" />
    </section>
  );
}
