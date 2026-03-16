'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/types/blog';

interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0% -80% 0%',
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className={cn('space-y-1', className)}>
      <div className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Содержание
      </div>
      <ul className="space-y-1 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                'w-full text-left py-1.5 px-3 text-sm transition-colors hover:text-primary',
                activeId === item.id
                  ? 'text-primary font-medium border-l-2 -ml-px border-primary bg-primary/5'
                  : 'text-muted-foreground',
                item.level === 3 && 'pl-6',
                item.level === 4 && 'pl-9'
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
