import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { OffersGrid } from '@/components/offers';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Offer } from '@/types/offer';

interface OffersSectionProps {
  offers: Offer[];
  className?: string;
  title?: string;
  description?: string;
  showMore?: boolean;
  showAllLink?: boolean;
  id?: string;
}

export function OffersSection({
  offers,
  className,
  title = 'Лучшие предложения',
  description = 'Проверенные МФО с высоким процентом одобрения',
  showMore = false,
  showAllLink = false,
  id = 'offers',
}: OffersSectionProps) {
  return (
    <section id={id} className={cn('py-12 sm:py-16 bg-muted/30', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Offers grid */}
        <OffersGrid
          offers={offers}
          featuredIds={offers.filter((o) => o.isFeatured).map((o) => o.id)}
        />

        {/* Show all link button */}
        {showAllLink && (
          <div className="mt-8 text-center">
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/mfo">
                Все предложения
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Show more button */}
        {showMore && offers.length > 6 && (
          <div className="mt-8 text-center">
            <button
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border border-border bg-card',
                'px-6 py-2.5 text-sm font-medium text-muted-foreground transition-all',
                'hover:border-primary/30 hover:bg-primary/5 hover:text-primary shadow-sm'
              )}
            >
              Показать ещё
              <span className="text-muted-foreground/60">
                ({offers.length - 6} предложений)
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
