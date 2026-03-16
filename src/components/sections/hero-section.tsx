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
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeroSectionProps {
  className?: string;
}

interface QuickFilterState {
  amount: number;
  term: number;
  payoutMethod: string;
  firstLoanZero: boolean;
  urgent: boolean;
  noCalls: boolean;
  badCreditOk: boolean;
}

const AMOUNT_MIN = 1000;
const AMOUNT_MAX = 100000;
const AMOUNT_STEP = 1000;
const TERM_MIN = 1;
const TERM_MAX = 30;
const TERM_STEP = 1;

const PAYOUT_METHODS = [
  { value: 'card', label: 'На карту' },
  { value: 'cash', label: 'Наличными' },
  { value: 'bank_account', label: 'На счёт' },
];

const QUICK_TAGS = [
  { id: 'card', label: 'На карту', icon: CreditCard },
  { id: 'zero', label: 'Первый займ 0%', icon: Zap },
  { id: 'urgent', label: 'Срочно', icon: Clock },
  { id: 'bad-credit', label: 'С плохой КИ', icon: ShieldCheck },
];

const MICRO_BENEFITS = [
  { icon: CreditCard, value: '8+', label: 'предложений' },
  { icon: Clock, value: '~5 мин', label: 'решение' },
  { icon: RefreshCw, value: 'ежедневно', label: 'обновление' },
];

export function HeroSection({ className }: HeroSectionProps) {
  const [filters, setFilters] = React.useState<QuickFilterState>({
    amount: 15000,
    term: 14,
    payoutMethod: 'card',
    firstLoanZero: false,
    urgent: false,
    noCalls: false,
    badCreditOk: false,
  });

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const formatTerm = (value: number) => {
    if (value === 1) return '1 день';
    if (value < 5) return `${value} дня`;
    if (value < 21) return `${value} дней`;
    const lastDigit = value % 10;
    if (lastDigit === 1) return `${value} день`;
    if (lastDigit < 5) return `${value} дня`;
    return `${value} дней`;
  };

  // Calculate estimated overpayment (0.8% per day for regular, 0% for first loan)
  const dailyRate = filters.firstLoanZero ? 0 : 0.008;
  const overpayment = Math.round(filters.amount * dailyRate * filters.term);
  const totalRepayment = filters.amount + overpayment;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const offersSection = document.getElementById('offers');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              {QUICK_TAGS.map((tag) => {
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

          {/* ===== ПРАВАЯ КОЛОНКА - КАЛЬКУЛЯТОР ===== */}
          <div className="order-1 lg:order-2" id="calculator">
            <Card className="border-border shadow-lg bg-card">
              <CardContent className="p-4 sm:p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Калькулятор</span>
                  </div>
                  
                  {/* Сумма займа */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">Сумма</Label>
                      <span className="text-sm font-bold text-primary">
                        {formatAmount(filters.amount)} ₽
                      </span>
                    </div>
                    <Slider
                      value={[filters.amount]}
                      min={AMOUNT_MIN}
                      max={AMOUNT_MAX}
                      step={AMOUNT_STEP}
                      onValueChange={([value]) => setFilters((prev) => ({ ...prev, amount: value }))}
                    />
                  </div>

                  {/* Срок займа */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">Срок</Label>
                      <span className="text-sm font-bold text-primary">
                        {formatTerm(filters.term)}
                      </span>
                    </div>
                    <Slider
                      value={[filters.term]}
                      min={TERM_MIN}
                      max={TERM_MAX}
                      step={TERM_STEP}
                      onValueChange={([value]) => setFilters((prev) => ({ ...prev, term: value }))}
                    />
                  </div>

                  {/* Способ получения */}
                  <Select
                    value={filters.payoutMethod}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, payoutMethod: value }))}
                  >
                    <SelectTrigger className="w-full bg-muted border-border text-foreground h-9 text-sm">
                      <SelectValue placeholder="Способ получения" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {PAYOUT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Чекбоксы в 2 колонки */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'firstLoanZero', label: '0% новым', checked: filters.firstLoanZero },
                      { id: 'urgent', label: 'Срочно', checked: filters.urgent },
                      { id: 'noCalls', label: 'Без звонков', checked: filters.noCalls },
                      { id: 'badCreditOk', label: 'Плохая КИ', checked: filters.badCreditOk },
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={(checked) =>
                            setFilters((prev) => ({ ...prev, [item.id]: !!checked }))
                          }
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                        />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Результат расчёта */}
                  <div className="rounded-lg bg-primary/5 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">К возврату:</span>
                      <span className="font-bold text-foreground">{formatAmount(totalRepayment)} ₽</span>
                    </div>
                    {!filters.firstLoanZero && overpayment > 0 && (
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Переплата:</span>
                        <span className="font-medium text-primary">{formatAmount(overpayment)} ₽</span>
                      </div>
                    )}
                    {filters.firstLoanZero && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <Zap className="h-3 w-3" />
                        <span className="font-medium">0% — без переплаты!</span>
                      </div>
                    )}
                  </div>

                  {/* CTA кнопка */}
                  <Button
                    type="submit"
                    className="w-full h-10 text-sm font-semibold"
                  >
                    Показать предложения
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />
    </section>
  );
}
