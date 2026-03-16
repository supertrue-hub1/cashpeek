/**
 * Блок перелинковки - связанные страницы
 * Anti-Orphan Pages: создаем связи между страницами
 */

import Link from 'next/link';
import { ArrowRight, MapPin, CreditCard, Clock, Layers } from 'lucide-react';
import { LOAN_CATEGORIES, CITIES } from '@/lib/seo/slugs';

interface RelatedLinksProps {
  citySlug?: string;
  cityName?: string;
  loanTypeSlug?: string;
  loanTypeName?: string;
  maxLinks?: number;
}

// Получаем соседние типы займов (кроме текущего) - детерминированно
function getRelatedLoanTypes(currentSlug?: string) {
  const allTypes = Object.entries(LOAN_CATEGORIES);
  return allTypes
    .filter(([slug]) => slug !== currentSlug)
    .slice(0, 4)
    .map(([slug, data]) => ({ slug, name: data.name }));
}

// Получаем похожие города (кроме текущего) - детерминированно
function getRelatedCities(currentSlug?: string) {
  const allCities = Object.entries(CITIES);
  return allCities
    .filter(([slug]) => slug !== currentSlug)
    .slice(0, 5)
    .map(([slug, data]) => ({ slug, name: data.name, preposition: data.preposition }));
}

export function RelatedLinks({
  citySlug,
  cityName,
  loanTypeSlug,
  loanTypeName,
  maxLinks = 6,
}: RelatedLinksProps) {
  const relatedLoanTypes = getRelatedLoanTypes(loanTypeSlug);
  const relatedCities = getRelatedCities(citySlug);
  
  return (
    <section className="py-8 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Похожие страницы
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Другие типы займов в том же городе */}
          {citySlug && (
            <div className="bg-muted rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Другие займы {cityName ? `в ${cityName}` : ''}
              </h3>
              <div className="space-y-2">
                {relatedLoanTypes.slice(0, maxLinks / 2).map((type) => (
                  <Link
                    key={type.slug}
                    href={`/zaimy/${type.slug}/v-${citySlug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background hover:shadow-sm transition-all group"
                  >
                    <span className="text-sm text-muted-foreground group-hover:text-primary">
                      {type.name}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Тот же тип займа в других городах */}
          {loanTypeSlug && (
            <div className="bg-muted rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {loanTypeName || 'Займы'} в других городах
              </h3>
              <div className="space-y-2">
                {relatedCities.slice(0, maxLinks / 2).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/zaimy/${loanTypeSlug}/v-${city.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background hover:shadow-sm transition-all group"
                  >
                    <span className="text-sm text-muted-foreground group-hover:text-primary">
                      {city.preposition}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Все займы в городе */}
        {citySlug && (
          <div className="mt-6 text-center">
            <Link
              href={`/zaimy/v-${citySlug}`}
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              Все займы в {cityName}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// Компонент для нижней перелинковки (footer links)
interface SeoFooterLinksProps {
  citySlug?: string;
  loanTypeSlug?: string;
}

export function SeoFooterLinks({ citySlug, loanTypeSlug }: SeoFooterLinksProps) {
  const relatedLoanTypes = getRelatedLoanTypes(loanTypeSlug);
  const relatedCities = getRelatedCities(citySlug);
  
  return (
    <div className="bg-muted rounded-xl p-6 mt-8">
      <h3 className="font-semibold text-foreground mb-4">Полезные ссылки</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Текущий город - все типы */}
        {citySlug && (
          <Link
            href={`/zaimy/v-${citySlug}`}
            className="px-3 py-1.5 bg-background border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
          >
            Все займы в этом городе
          </Link>
        )}
        
        {/* Другие города */}
        {loanTypeSlug && relatedCities.slice(0, 3).map((city) => (
          <Link
            key={city.slug}
            href={`/zaimy/${loanTypeSlug}/v-${city.slug}`}
            className="px-3 py-1.5 bg-background border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
          >
            {city.name}
          </Link>
        ))}
        
        {/* Другие типы */}
        {citySlug && relatedLoanTypes.slice(0, 3).map((type) => (
          <Link
            key={type.slug}
            href={`/zaimy/${type.slug}/v-${citySlug}`}
            className="px-3 py-1.5 bg-background border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
          >
            {type.name}
          </Link>
        ))}
        
        {/* Общие страницы */}
        <Link
          href="/zaimy"
          className="px-3 py-1.5 bg-background border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
        >
          Все займы
        </Link>
        <Link
          href="/sravnit"
          className="px-3 py-1.5 bg-background border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
        >
          Сравнить
        </Link>
      </div>
    </div>
  );
}
