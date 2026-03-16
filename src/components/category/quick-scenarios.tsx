'use client';

import * as React from 'react';
import { Clock, Percent, ShieldCheck, Wallet, AlertTriangle, Users, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScenarioItem, ScenarioIconName } from '@/lib/category/category-config';

const ICON_MAP: Record<ScenarioIconName, React.ComponentType<{ className?: string }>> = {
  'clock': Clock,
  'percent': Percent,
  'shield-check': ShieldCheck,
  'wallet': Wallet,
  'alert-triangle': AlertTriangle,
  'users': Users,
  'credit-card': CreditCard,
};

interface QuickScenariosProps {
  scenarios: ScenarioItem[];
  activeId?: string;
  onSelect?: (id: string, filter: Record<string, unknown>) => void;
}

export function QuickScenarios({ scenarios, activeId, onSelect }: QuickScenariosProps) {
  return (
    <section className="py-6 border-b border-border/50 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-muted-foreground">Быстрый подбор:</span>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {scenarios.map((scenario) => {
            const Icon = ICON_MAP[scenario.icon];
            const isActive = activeId === scenario.id;
            
            return (
              <button
                key={scenario.id}
                onClick={() => onSelect?.(scenario.id, scenario.filter)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                  'border transition-all duration-200',
                  'hover:shadow-md',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-primary')} />
                <div className="text-left">
                  <div>{scenario.label}</div>
                  <div className={cn('text-xs', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {scenario.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
