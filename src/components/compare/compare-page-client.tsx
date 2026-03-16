/**
 * Compare Page Client Component
 * 
 * Клиентская обёртка для страницы сравнения с:
 * - Фильтрами
 * - Сравнением МФО
 * - Избранным
 */

'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OfferFilters, type OfferFiltersState } from '@/components/offers/offer-filters';
import { OffersGrid } from '@/components/offers';
import { ComparePanel, CompareTable } from '@/components/compare/compare-button';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import type { OfferData } from '@/lib/seo-hub/types';

interface ComparePageClientProps {
  offers: OfferData[];
}

function CompareContent({ offers }: ComparePageClientProps) {
  const searchParams = useSearchParams();
  const showCompare = searchParams.get('compare') === 'true';
  
  const [filteredOffers, setFilteredOffers] = useState(offers);
  
  const handleFilterChange = (filtered: OfferData[]) => {
    setFilteredOffers(filtered);
  };
  
  return (
    <>
      {/* Filters */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <OfferFilters 
            offers={offers} 
            onFilterChange={handleFilterChange}
          />
        </div>
      </section>
      
      {/* Compare Table (если открыто) */}
      {showCompare && (
        <section className="bg-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CompareTable offers={filteredOffers} />
          </div>
        </section>
      )}
      
      {/* Offers Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredOffers.length > 0 ? (
          <OffersGrid
            offers={filteredOffers}
            featuredIds={filteredOffers.filter((o) => o.isFeatured).map((o) => o.id)}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              По выбранным фильтрам ничего не найдено
            </p>
          </div>
        )}
      </section>
      
      {/* Floating Compare Panel */}
      <ComparePanel />
    </>
  );
}

export function ComparePageClient({ offers }: ComparePageClientProps) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CompareContent offers={offers} />
    </Suspense>
  );
}

export default ComparePageClient;
