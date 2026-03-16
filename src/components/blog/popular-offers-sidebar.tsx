'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types/offer';

interface PopularOffersSidebarProps {
  offers: Offer[];
  title?: string;
  className?: string;
}

export function PopularOffersSidebar({ 
  offers, 
  title = 'Лучшие предложения',
  className 
}: PopularOffersSidebarProps) {
  if (offers.length === 0) return null;

  return (
    <Card className={cn('sticky top-24', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {offers.slice(0, 3).map((offer, index) => (
            <Link
              key={offer.id}
              href={`/mfo/${offer.slug}`}
              className="group flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              {/* Rank */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary flex-shrink-0">
                {index + 1}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {offer.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {offer.rating}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {offer.decisionTime === 0 ? 'мгновенно' : `${offer.decisionTime} мин`}
                  </span>
                </div>
              </div>
              
              {/* Badge */}
              {offer.firstLoanRate === 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  0%
                </Badge>
              )}
              
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
        
        <Button asChild className="w-full mt-4" size="sm">
          <Link href="/sravnit">
            Сравнить все
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
