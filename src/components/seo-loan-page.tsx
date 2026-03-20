'use client';

import * as React from 'react';
import { OffersGrid } from '@/components/offers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calculator,
  Coins,
  Clock,
  Calendar,
  TrendingDown,
  TrendingUp,
  Timer,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types/offer';

type SortType = 'min_overpayment' | 'max_amount' | 'quick_approval' | 'rating';

interface SEOLoanPageProps {
  offers: Offer[]; // Already filtered offers
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  features?: { icon: React.ReactNode; title: string; description: string }[];
  faq?: { question: string; answer: string }[];
  contentBefore?: React.ReactNode;
  contentAfter?: React.ReactNode;
}

// Default rate for calculation
const DEFAULT_RATE = 0.8;

// Calculate overpayment
function calculateOverpayment(amount: number, days: number, firstLoanRate?: number): number {
  if (firstLoanRate === 0) return 0;
  return Math.round(amount * (DEFAULT_RATE / 100) * days);
}

// Format return date
function formatReturnDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export function SEOLoanPage({
  offers: filteredOffers,
  title,
  description,
  keywords,
  h1,
  features,
  faq,
  contentBefore,
  contentAfter,
}: SEOLoanPageProps) {
  const [amount, setAmount] = React.useState(15000);
  const [term, setTerm] = React.useState(14);
  const [sortBy, setSortBy] = React.useState<SortType>('rating');
  const [limit, setLimit] = React.useState(21);

  // Calculator totals
  const overpayment = calculateOverpayment(amount, term);
  const totalToReturn = amount + overpayment;
  const returnDate = formatReturnDate(term);

  // Sort offers
  const sortedOffers = React.useMemo(() => {
    const sorted = [...filteredOffers];

    switch (sortBy) {
      case 'min_overpayment':
        return sorted.sort((a, b) => {
          const aOver = calculateOverpayment(amount, term, a.firstLoanRate);
          const bOver = calculateOverpayment(amount, term, b.firstLoanRate);
          return aOver - bOver;
        });
      case 'max_amount':
        return sorted.sort((a, b) => b.maxAmount - a.maxAmount);
      case 'quick_approval':
        return sorted.sort((a, b) => a.decisionTime - b.decisionTime);
      case 'rating':
      default:
        return sorted.sort((a, b) => b.rating - a.rating);
    }
  }, [filteredOffers, sortBy, amount, term]);

  // Visible offers with pagination
  const visibleOffers = sortedOffers.slice(0, limit);
  const hasMore = limit < sortedOffers.length;
  const remaining = sortedOffers.length - limit;

  // Stats
  const zeroPercentCount = filteredOffers.filter(o => o.firstLoanRate === 0).length;
  const avgRating = filteredOffers.length > 0
    ? (filteredOffers.reduce((sum, o) => sum + o.rating, 0) / filteredOffers.length).toFixed(1)
    : '0';
  const avgApproval = filteredOffers.length > 0
    ? Math.round(filteredOffers.reduce((sum, o) => sum + o.approvalRate, 0) / filteredOffers.length)
    : 0;

  // Best offer for CTA
  const bestOffer = sortedOffers[0];

  const handleShowMore = () => {
    setLimit(prev => prev + 21);
  };

  return (
    <div className="space-y-8">
      {/* Content Before */}
      {contentBefore}

      {/* Container for offers - same as main page */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

      {/* Calculator Card */}
      <div 
        className="mx-auto bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl border border-primary/10 px-4 sm:px-8 py-6"
        style={{ maxWidth: '1220px' }}
      >
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: Sliders */}
          <div className="flex flex-col justify-center">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Калькулятор займа</h2>
                <p className="text-xs text-muted-foreground">Рассчитайте переплату онлайн</p>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6">
              {/* Amount Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Coins className="h-4 w-4 text-primary" />
                    Сумма
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">
                      {amount.toLocaleString('ru-RU')}
                    </span>
                    <span className="text-sm text-muted-foreground">₽</span>
                  </div>
                </div>
                <Slider
                  value={[amount]}
                  onValueChange={(values) => values[0] && setAmount(values[0])}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 000 ₽</span>
                  <span>100 000 ₽</span>
                </div>
              </div>

              {/* Term Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    Срок
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{term}</span>
                    <span className="text-sm text-muted-foreground">
                      {term === 1 ? 'день' : term < 5 ? 'дня' : 'дней'}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[term]}
                  onValueChange={(values) => values[0] && setTerm(values[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 день</span>
                  <span>30 дней</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3 text-green-600" />
                {zeroPercentCount} под 0%
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Star className="h-3 w-3 text-yellow-600" />
                Рейтинг {avgRating}
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs">
                <CheckCircle className="h-3 w-3 text-blue-600" />
                {avgApproval}% одобрение
              </Badge>
            </div>
          </div>

          {/* Right: Result + CTA */}
          <div className="flex flex-col justify-center">
            <div className="bg-background rounded-xl border border-border shadow-sm p-5">
              {/* Return Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4" />
                К возврату {returnDate}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Сумма</span>
                  <span className="font-semibold">{amount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Переплата</span>
                  <span className={cn("font-semibold", overpayment === 0 ? "text-green-600" : "text-orange-600")}>
                    {overpayment === 0 ? '0 ₽ (под 0%)' : `${overpayment.toLocaleString('ru-RU')} ₽`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Итого</span>
                  <span className="text-xl font-bold">{totalToReturn.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {/* CTA Button */}
              {bestOffer && (
                <Button
                  asChild
                  className="w-full gap-2"
                  size="lg"
                >
                  <a href={bestOffer.affiliateUrl} target="_blank" rel="noopener noreferrer">
                    Получить деньги
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center mt-3">
                Ставка от 0% в день
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Сортировка:</span>
        {[
          { value: 'rating' as const, label: 'По рейтингу', icon: Star },
          { value: 'min_overpayment' as const, label: 'Мин. переплата', icon: TrendingDown },
          { value: 'max_amount' as const, label: 'Макс. сумма', icon: TrendingUp },
          { value: 'quick_approval' as const, label: 'Быстрое одобрение', icon: Timer },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSortBy(value)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
              sortBy === value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-background border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
        </div>
      </div>

      {/* Offers Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {sortedOffers.length} {sortedOffers.length === 1 ? 'предложение' : sortedOffers.length < 5 ? 'предложения' : 'предложений'}
          </h2>
          <p className="text-muted-foreground">
            Нажмите «Подробнее» для просмотра всех условий
          </p>
        </div>

        {visibleOffers.length > 0 ? (
          <>
            <OffersGrid
              offers={visibleOffers}
              featuredIds={visibleOffers.filter((o) => o.isFeatured).map((o) => o.id)}
            />
            
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  Показать ещё
                  <span className="text-muted-foreground">
                    ({remaining} {remaining === 1 ? 'предложение' : remaining < 5 ? 'предложения' : 'предложений'})
                  </span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              Нет предложений по выбранным критериям
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Сбросить фильтры
            </Button>
          </Card>
        )}
      </div>
      </div>

      {/* Features */}
      {features && features.length > 0 && (
        <section className="py-8 border-t">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">
              Преимущества
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Content After */}
      {contentAfter}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <section className="py-8 border-t">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Часто задаваемые вопросы
              </h2>
            </div>
            <div className="space-y-4">
              {faq.map((item, index) => (
                <details
                  key={index}
                  className="group bg-muted/50 rounded-xl p-4 cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-medium text-foreground list-none">
                    {item.question}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
