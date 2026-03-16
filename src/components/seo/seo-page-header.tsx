/**
 * Компонент заголовка SEO-страницы
 * Включает H1, description, breadcrumb, статистику
 */

import { ChevronRight, MapPin, CreditCard, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface SeoPageHeaderProps {
  h1: string;
  description?: string;
  cityName?: string;
  cityPreposition?: string;
  loanTypeName?: string;
  offersCount?: number;
  showStats?: boolean;
}

export function SeoPageHeader({
  h1,
  description,
  cityName,
  cityPreposition,
  loanTypeName,
  offersCount = 0,
  showStats = true,
}: SeoPageHeaderProps) {
  return (
    <section className="bg-gradient-to-b from-muted to-background border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/zaimy" className="hover:text-primary transition-colors">Займы</Link>
          {loanTypeName && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{loanTypeName}</span>
            </>
          )}
          {cityName && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{cityPreposition || cityName}</span>
            </>
          )}
        </nav>
        
        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {h1}
        </h1>
        
        {/* Description */}
        {description && (
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            {description}
          </p>
        )}
        
        {/* Stats */}
        {showStats && (
          <div className="flex flex-wrap gap-4 text-sm">
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              {offersCount} предложений
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              За 5 минут
            </Badge>
            {cityName && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {cityName}
              </Badge>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
