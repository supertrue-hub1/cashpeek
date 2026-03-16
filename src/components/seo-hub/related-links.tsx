import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Building } from 'lucide-react';
import type { RelatedLink } from '@/lib/seo-hub/types';

interface RelatedLinksProps {
  relatedCities: RelatedLink[];
  relatedCategories: RelatedLink[];
  currentCity?: string;
  currentCategory?: string;
}

export function RelatedLinks({
  relatedCities,
  relatedCategories,
  currentCity,
  currentCategory,
}: RelatedLinksProps) {
  // Защита от undefined
  const safeCities = relatedCities || [];
  const safeCategories = relatedCategories || [];
  
  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Related Cities */}
          {safeCities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {currentCategory} в других городах
                </h3>
              </div>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {safeCities.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {link.title}
                      </p>
                      {link.description && (
                        <p className="text-xs text-muted-foreground">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Categories */}
          {safeCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Другие типы займов {currentCity ? `в ${currentCity}` : ''}
                </h3>
              </div>
              
              <div className="grid gap-2 sm:grid-cols-2">
                {safeCategories.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {link.title}
                      </p>
                      {link.description && (
                        <p className="text-xs text-muted-foreground">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
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
