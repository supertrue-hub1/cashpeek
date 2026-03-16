'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LOAN_CATEGORIES, CITIES, type LoanCategorySlug, type CitySlug } from '@/lib/seo/slugs';

interface InternalLinksProps {
  currentCategory?: string;
  showCategories?: boolean;
  showCities?: boolean;
  maxCategories?: number;
  maxCities?: number;
}

export function InternalLinks({
  currentCategory,
  showCategories = true,
  showCities = true,
  maxCategories = 6,
  maxCities = 12,
}: InternalLinksProps) {
  // Фильтруем текущую категорию
  const otherCategories = Object.entries(LOAN_CATEGORIES)
    .filter(([slug]) => slug !== currentCategory)
    .slice(0, maxCategories);

  const popularCities = Object.entries(CITIES)
    .sort((a, b) => (b[1].population || 0) - (a[1].population || 0))
    .slice(0, maxCities);

  return (
    <section className="py-10 bg-muted border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Похожие категории */}
          {showCategories && otherCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Другие категории</h2>
              </div>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {otherCategories.map(([slug, category]) => (
                  <Link
                    key={slug}
                    href={`/zaimy/${slug}`}
                    className="group flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {category.shortDesc}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Популярные города */}
          {showCities && popularCities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Популярные города</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {popularCities.map(([slug, city]) => (
                  <Link
                    key={slug}
                    href={`/zaimy/v-${slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-full border border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:shadow-sm transition-all"
                  >
                    <MapPin className="h-3 w-3" />
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
