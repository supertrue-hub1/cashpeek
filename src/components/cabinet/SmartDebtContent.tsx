'use client';

import { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  Heart,
} from 'lucide-react';
import {
  DebtTrackerContent,
  DefaultPredictorContent,
  RefinanceContent,
  BrokerContent,
  CreditHealthContent,
} from '@/components/smart-debt';

type SubTabValue = 'tracker' | 'predictor' | 'refinance' | 'broker' | 'health';

interface SubTabConfig {
  value: SubTabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const SUB_TABS: SubTabConfig[] = [
  { value: 'tracker', label: 'Трекер', icon: TrendingUp, gradient: 'from-blue-500 to-cyan-500' },
  { value: 'predictor', label: 'Риск', icon: AlertTriangle, gradient: 'from-orange-500 to-red-500' },
  { value: 'refinance', label: 'Рефинанс', icon: RefreshCw, gradient: 'from-green-500 to-emerald-500' },
  { value: 'broker', label: 'Брокер', icon: MessageCircle, gradient: 'from-purple-500 to-pink-500' },
  { value: 'health', label: 'Здоровье', icon: Heart, gradient: 'from-rose-500 to-orange-500' },
];

const DEFAULT_SUBTAB: SubTabValue = 'tracker';

export function SmartDebtContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const subtabParam = searchParams.get('subtab');
  const activeSubtab: SubTabValue = SUB_TABS.some(t => t.value === subtabParam)
    ? (subtabParam as SubTabValue)
    : DEFAULT_SUBTAB;

  const handleSubtabChange = (value: SubTabValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'smart-debt');
    params.set('subtab', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderSubContent = () => {
    switch (activeSubtab) {
      case 'predictor':
        return <DefaultPredictorContent />;
      case 'refinance':
        return <RefinanceContent />;
      case 'broker':
        return <BrokerContent />;
      case 'health':
        return <CreditHealthContent />;
      case 'tracker':
      default:
        return <DebtTrackerContent />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Умный долг
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-помощник для управления долгами
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubtab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => handleSubtabChange(tab.value)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-sm`
                  : 'text-muted-foreground hover:text-foreground hover:bg-background'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {renderSubContent()}
      </div>
    </div>
  );
}
