'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, Shield, Clock, Percent, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MFOResult {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating: number;
  calculatedRate: number;
  approvalChance: number;
  decisionTime: number;
  totalRepayment: number;
  overpayment: number;
  firstLoanFree: boolean;
  isAvailable: boolean;
  badges: string[];
}

interface TopCategoriesProps {
  results: MFOResult[];
  amount: number;
}

export function TopCategories({ results, amount }: TopCategoriesProps) {
  const available = results.filter(r => r.isAvailable);
  
  // Находим лучшие в категориях
  const fastest = React.useMemo(() => {
    return [...available]
      .filter(r => r.decisionTime > 0)
      .sort((a, b) => a.decisionTime - b.decisionTime)[0];
  }, [available]);
  
  const cheapest = React.useMemo(() => {
    // Сначала 0%, потом по ставке
    return [...available]
      .filter(r => r.calculatedRate >= 0)
      .sort((a, b) => {
        if (a.firstLoanFree && !b.firstLoanFree) return -1;
        if (!a.firstLoanFree && b.firstLoanFree) return 1;
        return a.calculatedRate - b.calculatedRate;
      })[0];
  }, [available]);
  
  const mostReliable = React.useMemo(() => {
    return [...available]
      .sort((a, b) => b.approvalChance - a.approvalChance)[0];
  }, [available]);

  const categories = [
    {
      id: 'fastest',
      title: 'Быстрее всех',
      subtitle: 'Минимальное время',
      icon: Zap,
      gradient: 'from-cyan-50 to-blue-100 dark:from-cyan-950/30 dark:to-blue-900/20',
      border: 'border-cyan-300 dark:border-cyan-800',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      mfo: fastest,
      metric: fastest ? `${fastest.decisionTime} мин` : '—',
    },
    {
      id: 'cheapest',
      title: 'Выгоднее всех',
      subtitle: 'Лучшая ставка',
      icon: Percent,
      gradient: 'from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/20',
      border: 'border-emerald-300 dark:border-emerald-800',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      mfo: cheapest,
      metric: cheapest 
        ? cheapest.firstLoanFree 
          ? '0%' 
          : `${cheapest.calculatedRate}%`
        : '—',
    },
    {
      id: 'reliable',
      title: 'Надёжнее всех',
      subtitle: 'Высокий шанс одобрения',
      icon: Shield,
      gradient: 'from-violet-50 to-purple-100 dark:from-violet-950/30 dark:to-purple-900/20',
      border: 'border-violet-300 dark:border-violet-800',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-600 dark:text-violet-400',
      badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      mfo: mostReliable,
      metric: mostReliable ? `${mostReliable.approvalChance}%` : '—',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={cn(
            'relative overflow-hidden border-2 transition-all duration-300',
            'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
            category.gradient,
            category.border
          )}>
            {/* Декоративный элемент */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <category.icon className="w-full h-full" />
            </div>
            
            <CardContent className="p-4">
              {/* Заголовок категории */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  category.iconBg
                )}>
                  <category.icon className={cn('h-5 w-5', category.iconColor)} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {category.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {category.subtitle}
                  </p>
                </div>
              </div>
              
              {/* МФО */}
              {category.mfo ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {category.mfo.logo ? (
                      <img
                        src={category.mfo.logo}
                        alt={category.mfo.name}
                        className="w-8 h-8 rounded-lg object-contain bg-white"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {category.mfo.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {category.mfo.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          {category.mfo.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Метрика */}
                  <Badge className={cn('font-mono', category.badge)}>
                    {category.metric}
                  </Badge>
                  
                  {/* К возврату */}
                  <div className="text-xs text-muted-foreground">
                    К возврату: {category.mfo.totalRepayment.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Нет доступных
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
