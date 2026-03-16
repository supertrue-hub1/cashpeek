'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  Heart,
} from 'lucide-react';

export type TabValue = 'tracker' | 'predictor' | 'refinance' | 'broker' | 'health';

interface TabConfig {
  value: TabValue;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const TABS: TabConfig[] = [
  {
    value: 'tracker',
    label: 'Трекер долгов',
    description: 'AI-анализ и план погашения',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'predictor',
    label: 'Предиктор риска',
    description: 'Оценка риска дефолта',
    icon: AlertTriangle,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    value: 'refinance',
    label: 'Рефинансирование',
    description: 'Лучшие предложения',
    icon: RefreshCw,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    value: 'broker',
    label: 'AI-брокер',
    description: 'Чат с финансовым помощником',
    icon: MessageCircle,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    value: 'health',
    label: 'Кредитное здоровье',
    description: 'Скоринг и рекомендации',
    icon: Heart,
    gradient: 'from-rose-500 to-orange-500',
  },
];

interface SmartDebtSidebarProps {
  activeTab: TabValue;
}

export function SmartDebtSidebar({ activeTab }: SmartDebtSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <nav className="space-y-2">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'w-full text-left p-3 rounded-xl transition-all',
              isActive
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <div>
                <div className="font-medium text-sm">{tab.label}</div>
                <div className={cn(
                  'text-xs',
                  isActive ? 'text-white/80' : 'text-muted-foreground'
                )}>
                  {tab.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export { TABS };
