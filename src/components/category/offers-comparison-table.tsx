'use client';

import * as React from 'react';
import { OfferCard } from '@/components/offers/offer-card';
import type { Offer } from '@/types/offer';

interface OffersComparisonTableProps {
  offers: Offer[];
  className?: string;
}

export function OffersComparisonTable({ offers, className }: OffersComparisonTableProps) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Нет предложений для отображения</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop Table - скрыт на мобильных */}
      <div className="hidden lg:block">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">МФО</th>
                <th className="text-center p-4 font-medium text-foreground">Сумма</th>
                <th className="text-center p-4 font-medium text-foreground">Срок</th>
                <th className="text-center p-4 font-medium text-foreground">Ставка</th>
                <th className="text-center p-4 font-medium text-foreground">Решение</th>
                <th className="text-center p-4 font-medium text-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm">
                        {offer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{offer.name}</div>
                        <div className="text-xs text-muted-foreground">★ {offer.rating}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    {offer.minAmount.toLocaleString()}–{offer.maxAmount.toLocaleString()} ₽
                  </td>
                  <td className="p-4 text-center">
                    {offer.minTerm}–{offer.maxTerm} дней
                  </td>
                  <td className="p-4 text-center">
                    <span className={offer.firstLoanRate === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                      {offer.firstLoanRate === 0 ? '0%' : `${offer.firstLoanRate || offer.baseRate}%`}
                    </span>
                    {offer.firstLoanRate === 0 && (
                      <span className="text-xs text-muted-foreground block">новым</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {offer.decisionTime === 0 ? 'Мгновенно' : `${offer.decisionTime} мин`}
                  </td>
                  <td className="p-4 text-center">
                    <a
                      href={offer.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Получить
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards - используем OfferCard с модальным окном */}
      <div className="lg:hidden grid gap-4 sm:grid-cols-2">
        {offers.map((offer, index) => (
          <OfferCard 
            key={offer.id} 
            offer={offer}
            featured={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
