'use client';

import * as React from 'react';
import { ArrowRight, Star, Zap, Clock, CreditCard, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Offer } from '@/types/offer';

interface CompareLoansSectionProps {
  offers: Offer[];
  className?: string;
  maxItems?: number;
}

// Payout method labels
const payoutLabels: Record<string, string> = {
  card: 'На карту',
  cash: 'Наличные',
  bank_account: 'На счёт',
  yoomoney: 'ЮMoney',
  qiwi: 'QIWI',
  contact: 'Contact',
  golden_crown: 'Золотая Корона',
};

// MFO Logo component
function MFOLogo({ name, className }: { name: string; className?: string }) {
  const colors: Record<string, string> = {
    'Займер': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'MoneyMan': 'bg-gradient-to-br from-green-500 to-green-600',
    'еКапуста': 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'Турбозайм': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'Moneza': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'Webbankir': 'bg-gradient-to-br from-sky-500 to-sky-600',
    'До зарплаты': 'bg-gradient-to-br from-amber-500 to-amber-600',
    'Lime': 'bg-gradient-to-br from-lime-500 to-lime-600',
  };
  const bgColor = colors[name] || 'bg-gradient-to-br from-slate-500 to-slate-600';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className={cn('flex items-center justify-center rounded-lg text-white font-bold text-xs shrink-0', bgColor, className)}>
      {initials}
    </div>
  );
}

// Format decision time
function formatDecisionTime(minutes: number): string {
  if (minutes === 0) return 'Мгновенно';
  if (minutes === 1) return '1 мин';
  if (minutes < 60) return `${minutes} мин`;
  return `${Math.floor(minutes / 60)} ч`;
}

// Desktop table row
function TableRow({ offer, index }: { offer: Offer; index: number }) {
  const mainPayoutMethod = offer.payoutMethods[0];
  const payoutLabel = payoutLabels[mainPayoutMethod] || 'На карту';
  
  return (
    <tr className={cn(
      'border-b border-border transition-colors hover:bg-muted/50',
      offer.isFeatured && 'bg-primary/5'
    )}>
      {/* МФО */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <MFOLogo name={offer.name} className="h-9 w-9 text-sm" />
          <div>
            <div className="font-medium text-foreground text-sm">{offer.name}</div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">{offer.rating}</span>
              {offer.isNew && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-1">New</Badge>
              )}
            </div>
          </div>
        </div>
      </td>
      
      {/* Сумма */}
      <td className="py-3 px-3">
        <div className="text-sm text-foreground">
          {offer.minAmount.toLocaleString('ru-RU')} – {offer.maxAmount.toLocaleString('ru-RU')} ₽
        </div>
      </td>
      
      {/* Срок */}
      <td className="py-3 px-3">
        <div className="text-sm text-foreground">
          {offer.minTerm}–{offer.maxTerm} дней
        </div>
      </td>
      
      {/* Новые клиенты */}
      <td className="py-3 px-3">
        {offer.firstLoanRate === 0 ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 gap-1">
            <Zap className="h-3 w-3" />
            0%
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">
            от {(offer.firstLoanRate ?? offer.baseRate * 100).toFixed(1)}%
          </span>
        )}
      </td>
      
      {/* Решение */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDecisionTime(offer.decisionTime)}
        </div>
      </td>
      
      {/* Получение */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          {payoutLabel}
        </div>
      </td>
      
      {/* CTA */}
      <td className="py-3 px-3 text-right">
        <Button asChild size="sm" className="h-8 text-xs gap-1">
          <a href={offer.affiliateUrl} target="_blank" rel="noopener noreferrer">
            Оформить
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </td>
    </tr>
  );
}

// Mobile card
function MobileCard({ offer }: { offer: Offer }) {
  const mainPayoutMethod = offer.payoutMethods[0];
  const payoutLabel = payoutLabels[mainPayoutMethod] || 'На карту';
  
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-4 space-y-3',
      offer.isFeatured && 'ring-1 ring-primary/20 bg-primary/5'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <MFOLogo name={offer.name} className="h-10 w-10 text-sm" />
          <div>
            <h3 className="font-medium text-foreground">{offer.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">{offer.rating}</span>
              {offer.isNew && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-1">New</Badge>
              )}
            </div>
          </div>
        </div>
        
        {offer.firstLoanRate === 0 && (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 gap-1">
            <Zap className="h-3 w-3" />
            0% новым
          </Badge>
        )}
      </div>
      
      {/* Grid info */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Сумма</span>
          <span className="text-foreground font-medium">
            до {offer.maxAmount.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Срок</span>
          <span className="text-foreground font-medium">
            до {offer.maxTerm} дней
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Решение</span>
          <span className="text-foreground font-medium flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {formatDecisionTime(offer.decisionTime)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Получение</span>
          <span className="text-foreground font-medium flex items-center gap-1">
            <CreditCard className="h-3 w-3 text-muted-foreground" />
            {payoutLabel}
          </span>
        </div>
      </div>
      
      {/* Features */}
      <div className="flex flex-wrap gap-1">
        {offer.badCreditOk && (
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            С плохой КИ
          </Badge>
        )}
        {offer.noCalls && (
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            Без звонков
          </Badge>
        )}
        {offer.roundTheClock && (
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            24/7
          </Badge>
        )}
      </div>
      
      {/* CTA */}
      <Button asChild className="w-full h-9 text-sm gap-1">
        <a href={offer.affiliateUrl} target="_blank" rel="noopener noreferrer">
          Оформить заявку
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

export function CompareLoansSection({ offers, className, maxItems = 8 }: CompareLoansSectionProps) {
  const displayOffers = maxItems ? offers.slice(0, maxItems) : offers;
  
  // Sort: featured first, then by rating
  const sortedOffers = [...displayOffers].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
    return b.rating - a.rating;
  });

  return (
    <section id="compare" className={cn('py-12 sm:py-16', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
            Сравнение займов онлайн
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Сравните условия проверенных МФО и выберите лучшее предложение. 
            Все компании имеют лицензию ЦБ РФ.
          </p>
        </div>

        {/* Desktop Table - hidden on mobile */}
        <div className="hidden md:block">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">МФО</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Сумма</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Срок</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Новые клиенты</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Решение</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Получение</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOffers.map((offer, index) => (
                    <TableRow key={offer.id} offer={offer} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Link to full comparison */}
          <div className="mt-4 text-center">
            <a 
              href="/sravnit" 
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Открыть полное сравнение
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Mobile Cards - visible only on mobile */}
        <div className="md:hidden space-y-3">
          {sortedOffers.slice(0, 5).map((offer) => (
            <MobileCard key={offer.id} offer={offer} />
          ))}
          
          {/* Show more link */}
          <a 
            href="/sravnit" 
            className="flex items-center justify-center gap-2 py-3 text-sm text-primary font-medium"
          >
            Смотреть все предложения
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {[
            { icon: Check, text: 'Лицензия ЦБ РФ' },
            { icon: Check, text: 'Без скрытых комиссий' },
            { icon: Check, text: 'Защита данных' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <item.icon className="h-4 w-4 text-green-600" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
