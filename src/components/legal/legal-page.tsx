'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export function LegalPage({ title, children, lastUpdated }: LegalPageProps) {
  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-2xl md:text-3xl font-bold">{title}</CardTitle>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Последнее обновление: {lastUpdated}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
            <div className="prose prose-sm dark:prose-invert max-w-none p-6">
              {children}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Стили для юридического текста
export function LegalDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 my-4">
      <div className="text-destructive font-bold uppercase text-sm mb-2">
        Важное предупреждение
      </div>
      <div className="text-foreground text-sm leading-relaxed font-medium">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ 
  number, 
  title, 
  children 
}: { 
  number: string; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-foreground mb-3">
        {number}. {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

export function LegalParagraph({ 
  number, 
  children 
}: { 
  number?: string; 
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-muted-foreground leading-relaxed">
      {number && <span className="font-medium text-foreground">{number} </span>}
      {children}
    </p>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 my-2">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}
