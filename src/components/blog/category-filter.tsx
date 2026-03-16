'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@/types/blog';

interface CategoryFilterProps {
  categories: BlogCategory[];
  className?: string;
}

function CategoryFilterContent({ categories, className }: CategoryFilterProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Link
        href="/blog"
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          !currentCategory
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
        )}
      >
        Все
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/blog?category=${category.slug}`}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            currentCategory === category.slug
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          )}
          style={{
            backgroundColor: currentCategory === category.slug ? category.color : undefined,
          }}
        >
          {category.name}
          {category.postCount !== undefined && category.postCount > 0 && (
            <span className="ml-1.5 opacity-70">({category.postCount})</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function CategoryFilter({ categories, className }: CategoryFilterProps) {
  return (
    <Suspense fallback={<div className="flex flex-wrap gap-2"><div className="px-4 py-2 rounded-full bg-muted animate-pulse">Загрузка...</div></div>}>
      <CategoryFilterContent categories={categories} className={className} />
    </Suspense>
  );
}
