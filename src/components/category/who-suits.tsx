'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { WhoSuitsItem } from '@/lib/category/category-config';

interface WhoSuitsProps {
  items: WhoSuitsItem[];
  title?: string;
}

export function WhoSuits({ items, title = 'Кому подходит' }: WhoSuitsProps) {
  return (
    <section className="py-10 bg-background border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              {/* Аватар/эмодзи */}
              <div className="text-2xl flex-shrink-0" aria-hidden="true">
                {item.avatar}
              </div>
              
              <div>
                <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
