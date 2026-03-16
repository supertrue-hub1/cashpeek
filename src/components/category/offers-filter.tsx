'use client';

import * as React from 'react';
import { SlidersHorizontal, Star, Clock, Percent, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortValue = 'rating' | 'rate' | 'amount' | 'term' | 'approval';

interface OffersFilterProps {
  offersCount: number;
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  activeFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
  onClearFilters?: () => void;
}

const SORT_OPTIONS: { value: SortValue; label: string; icon: React.ElementType }[] = [
  { value: 'rating', label: 'По рейтингу', icon: Star },
  { value: 'rate', label: 'По ставке', icon: Percent },
  { value: 'amount', label: 'По сумме', icon: TrendingUp },
  { value: 'term', label: 'По сроку', icon: Clock },
];

const FILTER_LABELS: Record<string, string> = {
  'firstLoanZero': '0% новым',
  'badCreditOk': 'Плохая КИ',
  'noCalls': 'Без звонков',
  'roundTheClock': '24/7',
  'urgent': 'Срочно',
};

export function OffersFilter({
  offersCount,
  sort,
  onSortChange,
  activeFilters = [],
  onRemoveFilter,
  onClearFilters,
}: OffersFilterProps) {
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-border/50 py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Левая часть — счётчик и активные фильтры */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{offersCount}</span> предложений
            </span>

            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="gap-1 pr-1 bg-primary/10 text-primary border-0"
                  >
                    {FILTER_LABELS[filter] || filter}
                    <button
                      onClick={() => onRemoveFilter?.(filter)}
                      className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <button
                  onClick={onClearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>

          {/* Правая часть — сортировка */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={(v) => onSortChange(v as SortValue)}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
