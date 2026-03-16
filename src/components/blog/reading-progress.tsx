'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function ReadingProgress({ className }: { className?: string }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className={cn('fixed top-0 left-0 right-0 h-1 bg-muted/50 z-50', className)}>
      <div
        className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
