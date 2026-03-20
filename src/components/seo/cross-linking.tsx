'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CrossLinkItem {
  /** Название (город или тип) */
  name: string;
  /** Slug для URL */
  slug: string;
  /** Количество офферов */
  offersCount?: number;
  /** Приоритет (для сортировки) */
  priority?: number;
}

interface CrossLinkingProps {
  /** Тип перелинковки */
  type: 'cities' | 'types';
  /** Текущий активный элемент */
  activeSlug?: string;
  /** Список элементов для отображения */
  items: CrossLinkItem[];
  /** Базовый URL */
  baseUrl?: string;
  /** Показывать счётчик офферов */
  showCount?: boolean;
  /** CSS классы */
  className?: string;
}

/**
 * CrossLinking - динамическая перелинковка городов/типов займов
 * Строится из БД, показывает 10 популярных комбинаций
 */
export function CrossLinking({
  type,
  activeSlug,
  items,
  baseUrl = '',
  showCount = true,
  className,
}: CrossLinkingProps) {
  // Формируем URL в зависимости от типа
  const buildUrl = (slug: string): string => {
    if (type === 'cities') {
      return `${baseUrl}/v-${slug}`;
    }
    return `${baseUrl}/${slug}`;
  };

  // Заголовок секции
  const title = type === 'cities' ? 'Другие города' : 'Другие типы займов';
  const Icon = type === 'cities' ? MapPin : CreditCard;

  // Ограничиваем 10 популярными
  const displayItems = items.slice(0, 10);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-6 border-t', className)}>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Заголовок секции */}
        <div className="flex items-center gap-2 mb-4">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>

        {/* Сетка ссылок */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {displayItems.map((item, index) => {
            const isActive = item.slug === activeSlug;
            const url = buildUrl(item.slug);

            return (
              <Link
                key={item.slug}
                href={url}
                className={cn(
                  'flex items-center justify-between gap-2 px-3 py-2 rounded-lg',
                  'text-sm font-medium transition-all',
                  'border border-border hover:border-primary/50 hover:bg-primary/5',
                  isActive && 'bg-primary/10 border-primary/30 text-primary'
                )}
              >
                <span className="truncate">{item.name}</span>
                {showCount && item.offersCount !== undefined && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {item.offersCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Ссылка "Все города" / "Все типы" */}
        {items.length > 10 && (
          <Link
            href={type === 'cities' ? `${baseUrl}/vse-goroda` : `${baseUrl}/vse-tipy`}
            className="inline-flex items-center gap-1 mt-4 text-sm text-primary hover:underline"
          >
            Показать все ({items.length})
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </section>
  );
}

export default CrossLinking;
