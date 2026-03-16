/**
 * InternalLinks - Компонент для внутренней перелинковки
 * 
 * Выводит списки ссылок на соседние страницы для SEO.
 * Помогает избежать Orphan Pages и улучшает Crawl Budget.
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface InternalLink {
  label: string;
  href: string;
}

interface InternalLinksProps {
  links: InternalLink[];
  className?: string;
  columns?: 1 | 2 | 3;
}

export function InternalLinks({
  links,
  className,
  columns = 1,
}: InternalLinksProps) {
  if (links.length === 0) return null;

  return (
    <nav className={cn('space-y-2', className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1 border-b border-dashed border-border/50 last:border-0"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * FooterSeoLinks - Блок перелинковки в футере
 * 
 * Выводит ссылки на соседние категории и города.
 */
interface FooterSeoLinksProps {
  currentCity?: string;
  currentType?: string;
  cities: Array<{ name: string; slug: string }>;
  types: Array<{ name: string; slug: string }>;
}

export function FooterSeoLinks({
  currentCity,
  currentType,
  cities,
  types,
}: FooterSeoLinksProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-8 pt-8 border-t">
      {/* Типы займов */}
      <div>
        <h3 className="font-semibold mb-4">Виды займов</h3>
        <div className="grid grid-cols-2 gap-2">
          {types.map((type) => (
            <Link
              key={type.slug}
              href={currentCity 
                ? `/${type.slug}/${currentCity}` 
                : `/${type.slug}`
              }
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {type.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Популярные города */}
      <div>
        <h3 className="font-semibold mb-4">Популярные города</h3>
        <div className="grid grid-cols-2 gap-2">
          {cities.slice(0, 10).map((city) => (
            <Link
              key={city.slug}
              href={currentType 
                ? `/${currentType}/${city.slug}` 
                : `/zaimy/${city.slug}`
              }
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Быстрые ссылки */}
      <div>
        <h3 className="font-semibold mb-4">Быстрые ссылки</h3>
        <div className="space-y-2">
          <Link
            href="/zaimy/na-kartu"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Займы на карту
          </Link>
          <Link
            href="/zaimy/bez-procentov"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Займы без процентов
          </Link>
          <Link
            href="/zaimy/bez-otkaza"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Займы без отказа
          </Link>
          <Link
            href="/sravnit"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Сравнить займы
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * BreadcrumbSchema - Схема хлебных крошек для JSON-LD
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
