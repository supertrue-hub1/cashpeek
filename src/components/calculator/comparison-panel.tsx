'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, TrendingUp, Percent, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  badges: string[];
}

interface ComparisonPanelProps {
  selectedMfos: MFOResult[];
  amount: number;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ComparisonPanel({
  selectedMfos,
  amount,
  onRemove,
  onClear,
}: ComparisonPanelProps) {
  if (selectedMfos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-2xl"
    >
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              Сравнение ({selectedMfos.length}/3)
            </Badge>
            <span className="text-sm text-muted-foreground">
              Выберите до 3 МФО для сравнения
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Очистить
          </Button>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedMfos.map((mfo, index) => (
            <motion.div
              key={mfo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-muted/50 rounded-xl p-4"
            >
              {/* Remove button */}
              <button
                onClick={() => onRemove(mfo.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              
              {/* Logo & Name */}
              <div className="flex items-center gap-3 mb-3">
                {mfo.logo ? (
                  <img
                    src={mfo.logo}
                    alt={mfo.name}
                    className="w-10 h-10 rounded-lg object-contain bg-white"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {mfo.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {mfo.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {mfo.rating}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Percent className="h-3 w-3" /> Ставка
                  </span>
                  <span className={cn(
                    'font-medium',
                    mfo.calculatedRate === 0 ? 'text-green-600' : 'text-foreground'
                  )}>
                    {mfo.calculatedRate === 0 ? '0%' : `${mfo.calculatedRate}%`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Шанс
                  </span>
                  <span className="font-medium text-foreground">
                    {mfo.approvalChance}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Время
                  </span>
                  <span className="font-medium text-foreground">
                    {mfo.decisionTime === 0 ? '⚡' : `${mfo.decisionTime} мин`}
                  </span>
                </div>
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">К возврату</span>
                  <span className="font-bold text-foreground">
                    {mfo.totalRepayment.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Переплата</span>
                  <span className={cn(
                    'font-medium',
                    mfo.overpayment === 0 ? 'text-green-600' : 'text-foreground'
                  )}>
                    {mfo.overpayment === 0 
                      ? '0 ₽' 
                      : `${mfo.overpayment.toLocaleString('ru-RU')} ₽`
                    }
                  </span>
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-1 mt-3">
                {mfo.firstLoanFree && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                    0% первый
                  </Badge>
                )}
                {mfo.badges.slice(0, 2).map((badge, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
          
          {/* Empty slots */}
          {[...Array(3 - selectedMfos.length)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-4 flex items-center justify-center min-h-[200px]"
            >
              <span className="text-sm text-muted-foreground">
                Добавьте МФО для сравнения
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
