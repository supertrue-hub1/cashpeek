'use client';

import * as React from 'react';
import {
  Percent,
  ShieldCheck,
  PhoneOff,
  CreditCard,
  Zap,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Scenario } from '@/types/offer';

interface ScenarioSectionProps {
  scenarios: Scenario[];
  className?: string;
  onScenarioClick?: (scenario: Scenario) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  percent: Percent,
  'shield-check': ShieldCheck,
  'phone-off': PhoneOff,
  'credit-card': CreditCard,
  zap: Zap,
  moon: Moon,
};

export function ScenarioSection({
  scenarios,
  className,
  onScenarioClick,
}: ScenarioSectionProps) {
  return (
    <section id="scenarios" className={cn('py-12 sm:py-16 bg-muted/30', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Быстрый подбор займа</h2>
          <p className="text-muted-foreground">
            Выберите подходящий сценарий и посмотрите актуальные предложения
          </p>
        </div>

        {/* Scenario grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {scenarios.map((scenario) => {
            const Icon = iconMap[scenario.icon] || Zap;
            
            return (
              <button
                key={scenario.id}
                onClick={() => onScenarioClick?.(scenario)}
                className={cn(
                  'group flex flex-col items-center rounded-2xl border border-border bg-card p-4 text-center transition-all',
                  'hover:border-primary/30 hover:shadow-md',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background'
                )}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                  <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{scenario.title}</h3>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
