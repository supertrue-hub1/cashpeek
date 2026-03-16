'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SeoContentProps {
  content: string;
  title?: string;
  className?: string;
}

export function SeoContent({ content, title, className }: SeoContentProps) {
  const [expanded, setExpanded] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    setExpanded(false);
  }, []);

  const showExpandButton = mounted && content.length > 300;
  const maxHeight = expanded || !showExpandButton ? 'none' : '200px';

  return (
    <section className={cn('py-10 bg-slate-50 border-y border-border/50', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {title && (
          <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
        )}
        
        <div 
          className="prose prose-slate max-w-none prose-p:text-muted-foreground prose-p:text-sm prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          style={{ maxHeight, overflow: 'hidden' }}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {showExpandButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-primary"
          >
            {expanded ? (
              <>
                Свернуть
                <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Читать далее
                <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </section>
  );
}
