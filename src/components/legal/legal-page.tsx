'use client';

import * as React from 'react';

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
  lastUpdated?: string;
}

export function LegalPage({ title, children, lastUpdated }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Последнее обновление: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl prose prose-neutral dark:prose-invert prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

// Стили для юридического текста
export function LegalDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 md:p-6 my-6 not-prose">
      <div className="text-destructive font-bold uppercase text-xs mb-3 tracking-wide">
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
    <section className="mb-8 not-prose">
      <h2 className="text-xl font-bold text-foreground mb-4">
        {number}. {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
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
    <ul className="list-disc list-inside space-y-2 my-4 pl-2">
      {items.map((item, index) => (
        <li key={index} className="text-sm text-muted-foreground leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  );
}
