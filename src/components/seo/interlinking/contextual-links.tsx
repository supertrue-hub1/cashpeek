'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  MapPin, 
  CreditCard, 
  Layers,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateFooterLinks, type ContextualLink, type FooterLinkItem } from '@/lib/seo/interlinking';

// Реэкспорт типов для обратной совместимости
export type { ContextualLink, FooterLinkItem };

// ============================================
// КОНТЕКСТУАЛЬНЫЕ ССЫЛКИ
// ============================================

interface ContextualLink {
  title: string;
  href: string;
  description?: string;
  badge?: string;
}

interface ContextualLinksProps {
  links: ContextualLink[];
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * Блок контекстных ссылок для внутренней перелинковки
 */
export function ContextualLinks({ 
  links, 
  title = 'Похожие запросы',
  columns = 3,
  className 
}: ContextualLinksProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          {title}
        </h2>

        <div className={cn('grid gap-4', gridCols[columns])}>
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group bg-muted rounded-xl p-4 hover:bg-primary/5 hover:shadow-md transition-all border border-transparent hover:border-primary/20"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                    {link.title}
                  </h3>
                  {link.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-1" />
              </div>
              {link.badge && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {link.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// ССЫЛКИ В ПОДВАЛЕ
// ============================================

interface FooterLinkItem {
  label: string;
  href: string;
  icon?: 'map' | 'card' | 'clock' | 'money';
}

interface SeoFooterLinksProps {
  title?: string;
  links?: FooterLinkItem[];
  variant?: 'tags' | 'list';
  citySlug?: string;
  loanTypeSlug?: string;
  className?: string;
}

const linkIcons = {
  map: MapPin,
  card: CreditCard,
  clock: Clock,
  money: DollarSign,
};

/**
 * SEO-ссылки в подвале категории
 */
export function SeoFooterLinks({ 
  title = 'Полезные ссылки',
  links,
  variant = 'tags',
  citySlug,
  loanTypeSlug,
  className 
}: SeoFooterLinksProps) {
  // Генерируем ссылки если не переданы
  const footerLinks = links || getFooterLinks(citySlug, loanTypeSlug);

  if (variant === 'tags') {
    return (
      <section className={className}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="bg-muted rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">{title}</h3>
            
            <div className="flex flex-wrap gap-2">
              {footerLinks.map((link, index) => {
                const Icon = link.icon ? linkIcons[link.icon] : null;
                return (
                  <Link
                    key={index}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="bg-muted rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">{title}</h3>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {footerLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background hover:shadow-sm transition-all group"
              >
                <span className="text-sm text-muted-foreground group-hover:text-primary">
                  {link.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Генератор ссылок для футера - используется локально
function getFooterLinks(citySlug?: string, loanTypeSlug?: string): FooterLinkItem[] {
  return generateFooterLinks(citySlug, loanTypeSlug);
}

// ============================================
// ПОПУЛЯРНЫЕ ЗАПРОСЫ
// ============================================

interface PopularQuery {
  query: string;
  href: string;
  count?: number;
}

interface PopularQueriesProps {
  queries: PopularQuery[];
  title?: string;
  className?: string;
}

/**
 * Блок популярных запросов
 */
export function PopularQueries({ 
  queries, 
  title = 'Популярные запросы',
  className 
}: PopularQueriesProps) {
  return (
    <section className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {title}
        </h2>

        <div className="flex flex-wrap gap-2">
          {queries.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-background border rounded-full text-sm text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all"
            >
              {item.query}
              {item.count && (
                <Badge variant="secondary" className="text-xs">
                  {item.count}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

