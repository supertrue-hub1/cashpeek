import * as React from 'react';
import { cn } from '@/lib/utils';
import { OfferCard } from './offer-card';
import type { Offer } from '@/types/offer';

interface OffersGridProps {
  offers: Offer[];
  className?: string;
  featuredIds?: string[];
  maxItems?: number;
}

export function OffersGrid({ 
  offers, 
  className, 
  featuredIds = [],
  maxItems 
}: OffersGridProps) {
  const displayOffers = maxItems ? offers.slice(0, maxItems) : offers;

  if (displayOffers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Нет подходящих предложений
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-4 sm:gap-6',
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {displayOffers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          featured={featuredIds.includes(offer.id) || offer.isFeatured}
        />
      ))}
    </div>
  );
}
