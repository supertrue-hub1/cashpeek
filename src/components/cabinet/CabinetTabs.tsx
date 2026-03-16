'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Heart,
  History,
  Settings,
  Shield,
  Bell,
  Brain,
} from 'lucide-react';
import { useMemo } from 'react';

export type TabValue = 'overview' | 'favorites' | 'history' | 'settings' | 'security' | 'notifications' | 'smart-debt';

interface TabConfig {
  value: TabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

const TABS: TabConfig[] = [
  { value: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { value: 'favorites', label: 'Избранное', icon: Heart },
  { value: 'history', label: 'История', icon: History },
  { value: 'notifications', label: 'Уведомления', icon: Bell },
  { value: 'smart-debt', label: 'Умный долг', icon: Brain, highlight: true },
  { value: 'security', label: 'Безопасность', icon: Shield },
  { value: 'settings', label: 'Настройки', icon: Settings },
];

const DEFAULT_TAB: TabValue = 'overview';

interface CabinetSidebarProps {
  activeTab?: string;
  isAdmin?: boolean;
}

export function CabinetSidebar({ activeTab, isAdmin }: CabinetSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Определяем текущую вкладку из URL или используем дефолтную
  const currentTab = useMemo((): TabValue => {
    const tabParam = activeTab || searchParams.get('tab');
    if (tabParam && TABS.some(t => t.value === tabParam)) {
      return tabParam as TabValue;
    }
    return DEFAULT_TAB;
  }, [activeTab, searchParams]);

  const handleTabChange = (value: string) => {
    const newTab = value as TabValue;
    
    // Формируем новый URL с параметром tab
    const params = new URLSearchParams(searchParams.toString());
    
    // Удаляем subtab если есть
    params.delete('subtab');
    
    if (newTab === DEFAULT_TAB) {
      params.delete('tab');
    } else {
      params.set('tab', newTab);
    }

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    
    // Навигация без скролла
    router.push(newUrl, { scroll: false });
  };

  return (
    <nav className="space-y-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.value;
        
        return (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : tab.highlight
                  ? 'text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 dark:text-purple-400'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
      
      {isAdmin && (
        <button
          onClick={() => router.push('/admin')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-primary bg-primary/10 hover:bg-primary/20"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Админ-панель</span>
        </button>
      )}
    </nav>
  );
}

export { DEFAULT_TAB, TABS };
