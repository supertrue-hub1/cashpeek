'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CtaOffer {
  id: string;
  name: string;
  slug: string;
  rating: number;
  maxAmount: number;
  firstLoanRate?: number;
  decisionTime: number;
}

interface BlogCtaBoxProps {
  title?: string;
  description?: string;
  offers?: CtaOffer[];
  variant?: 'inline' | 'sidebar' | 'bottom';
  className?: string;
}

const defaultOffers: CtaOffer[] = [
  {
    id: '1',
    name: 'Займер',
    slug: 'zaymer',
    rating: 4.8,
    maxAmount: 30000,
    firstLoanRate: 0,
    decisionTime: 2,
  },
  {
    id: '2',
    name: 'MoneyMan',
    slug: 'moneyman',
    rating: 4.6,
    maxAmount: 80000,
    firstLoanRate: 0,
    decisionTime: 1,
  },
  {
    id: '3',
    name: 'еКапуста',
    slug: 'ekapusta',
    rating: 4.7,
    maxAmount: 30000,
    firstLoanRate: 0,
    decisionTime: 0,
  },
];

export function BlogCtaBox({
  title = 'Лучшие предложения',
  description = 'Сравните условия и получите займ на выгодных условиях',
  offers = defaultOffers,
  variant = 'inline',
  className,
}: BlogCtaBoxProps) {
  if (variant === 'sidebar') {
    return (
      <Card className={cn('sticky top-24 border-primary/20', className)}>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          
          <div className="space-y-3">
            {offers.slice(0, 3).map((offer, index) => (
              <Link
                key={offer.id}
                href={`/mfo/${offer.slug}`}
                className="group flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {offer.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {offer.rating}
                    </span>
                    {offer.firstLoanRate === 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700">
                        0%
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
  
  if (variant === 'bottom') {
    return (
      <Card className={cn('bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20', className)}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link href="/sravnit">
                  Сравнить займы
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/">На главную</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Inline variant (default)
  return (
    <Card className={cn('my-8 overflow-hidden border-primary/20', className)}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
          {offers.slice(0, 3).map((offer) => (
            <Link
              key={offer.id}
              href={`/mfo/${offer.slug}`}
              className="group p-4 hover:bg-muted/50 transition-colors flex flex-col items-center text-center"
            >
              <div className="font-semibold group-hover:text-primary transition-colors mb-1">
                {offer.name}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {offer.rating}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  {offer.decisionTime === 0 ? 'мгновенно' : `${offer.decisionTime} мин`}
                </span>
              </div>
              {offer.firstLoanRate === 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  0% первый займ
                </Badge>
              )}
            </Link>
          ))}
        </div>
        
        <div className="p-4 bg-muted/30 border-t">
          <Button asChild className="w-full" variant="secondary">
            <Link href="/sravnit">
              Сравнить все предложения
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
