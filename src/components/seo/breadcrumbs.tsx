'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbSchema } from './schemas/breadcrumb-schema';

export interface BreadcrumbItem {
  /** Название элемента */
  name: string;
  /** URL ссылки */
  href?: string;
  /** Делает элемент неактивным (последний элемент) */
  disabled?: boolean;
}

interface BreadcrumbsProps {
  /** Элементы хлебных крошек */
  items: BreadcrumbItem[];
  /** Дополнительные классы */
  className?: string;
  /** Показывать иконку дома на первой ссылке */
  showHomeIcon?: boolean;
  /** Добавить Schema.org JSON-LD */
  enableSchema?: boolean;
}

/**
 * UI-компонент хлебных крошек на базе shadcn/ui
 * Легковесный — не увеличивает JS бандл
 */
export function Breadcrumbs({
  items,
  className,
  showHomeIcon = true,
  enableSchema = true,
}: BreadcrumbsProps) {
  // Фильтруем только активные элементы для Schema
  const schemaItems = enableSchema
    ? items
        .filter((item) => item.href)
        .map((item) => ({
          name: item.name,
          url: item.href!,
        }))
    : [];

  return (
    <>
      {/* Schema.org JSON-LD — рендерится на сервере */}
      {enableSchema && schemaItems.length > 0 && (
        <BreadcrumbSchema items={schemaItems} />
      )}

      {/* UI Component */}
      <nav
        aria-label="Breadcrumb"
        className={cn(
          'flex items-center gap-1 text-sm text-muted-foreground',
          className
        )}
      >
        <ol className="flex items-center gap-1 list-none m-0 p-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;

            return (
              <li
                key={index}
                className="flex items-center gap-1"
              >
                {/* Разделитель (кроме первого элемента) */}
                {!isFirst && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                )}

                {/* Ссылка или текст */}
                {item.href && !item.disabled ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'transition-colors hover:text-foreground',
                      isFirst && showHomeIcon && 'flex items-center gap-1'
                    )}
                  >
                    {isFirst && showHomeIcon && (
                      <Home className="h-3.5 w-3.5" />
                    )}
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'font-medium text-foreground',
                      item.disabled && 'cursor-default'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
