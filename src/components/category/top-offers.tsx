'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { OfferCard } from '@/components/offers/offer-card';
import type { Offer } from '@/types/offer';

interface TopOffersProps {
  offers: Offer[];
  title?: string;
  className?: string;
}

export function TopOffers({ offers, title = 'Рекомендуемые предложения', className }: TopOffersProps) {
  if (offers.length === 0) return null;

  return (
    <section className={cn('py-8 bg-muted/30', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.slice(0, 3).map((offer, index) => (
            <OfferCard 
              key={offer.id}
              offer={offer} 
              featured={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
