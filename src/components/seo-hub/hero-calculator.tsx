import { MapPin, Building, TrendingUp, Clock, Shield } from 'lucide-react';
import { CalculatorComponent } from './calculator';
import { Badge } from '@/components/ui/badge';
import type { CategoryInfo, CityInfo } from '@/lib/seo-hub/types';

interface HeroCalculatorProps {
  category: CategoryInfo;
  city: CityInfo;
  offersCount: number;
}

export function HeroCalculator({ category, city, offersCount }: HeroCalculatorProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
          {/* Left: Hero Content */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {city.name}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Building className="h-3 w-3" />
                {category.name}
              </Badge>
              {offersCount > 0 && (
                <Badge className="bg-green-600 hover:bg-green-700">
                  {offersCount} предложений
                </Badge>
              )}
            </div>
            
            {/* H1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {category.name}{' '}
              <span className="text-primary">{city.preposition}</span>
            </h1>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl">
              Сравните {offersCount}+ предложений {category.namePrepositional} {city.preposition}. 
              {category.shortDesc}. Быстрое одобрение за 5 минут.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">До 95%</p>
                  <p className="text-xs text-muted-foreground">одобрение</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">5-15 мин</p>
                  <p className="text-xs text-muted-foreground">решение</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">0%</p>
                  <p className="text-xs text-muted-foreground">новым</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">24/7</p>
                  <p className="text-xs text-muted-foreground">онлайн</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Calculator */}
          <div className="lg:sticky lg:top-24">
            <CalculatorComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
