'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Clock, 
  TrendingUp, 
  ExternalLink, 
  Plus, 
  Check, 
  ChevronDown,
  Shield,
  Zap,
  Percent,
  PhoneOff,
  Moon,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface MFOResult {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate: number | null;
  psk: number | null;
  approvalRate: number;
  decisionTime: number;
  firstLoanFree: boolean;
  badCreditOk: boolean;
  noCalls: boolean;
  roundTheClock: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  calculatedRate: number;
  totalRepayment: number;
  overpayment: number;
  approvalChance: number;
  smartScore: number;
  badges: string[];
  affiliateUrl: string | null;
}

interface MFOCardProps {
  mfo: MFOResult;
  index: number;
  amount: number;
  days: number;
  isInCompare: boolean;
  onToggleCompare: () => void;
  onGetLoan: () => void;
}

export function MFOCard({
  mfo,
  index,
  amount,
  days,
  isInCompare,
  onToggleCompare,
  onGetLoan,
}: MFOCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isTop = index === 0 && mfo.isAvailable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      <Card className={cn(
        'relative overflow-hidden transition-all duration-300',
        mfo.isAvailable 
          ? 'hover:shadow-lg hover:border-primary/50' 
          : 'opacity-60',
        isTop && 'ring-2 ring-primary ring-offset-2'
      )}>
        {/* Бейдж "Лучшее предложение" */}
        {isTop && (
          <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/50" />
        )}
        
        <CardContent className="p-4">
          {/* Верхняя часть: место, логотип, название */}
          <div className="flex items-start gap-3 mb-4">
            {/* Место в рейтинге */}
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0',
              index === 0 && mfo.isAvailable
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {index + 1}
            </div>
            
            {/* Логотип */}
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border flex items-center justify-center overflow-hidden shrink-0">
              {mfo.logo ? (
                <img
                  src={mfo.logo}
                  alt={mfo.name}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {mfo.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Название и рейтинг */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {mfo.name}
                </h3>
                {isTop && (
                  <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
                    Топ
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-foreground">
                    {mfo.rating}
                  </span>
                </div>
                {mfo.firstLoanFree && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                    0% первый
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Метрики */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Percent className="h-3 w-3" />
                <span className="text-xs">Ставка</span>
              </div>
              <span className={cn(
                'font-semibold',
                mfo.calculatedRate === 0 ? 'text-green-600' : 'text-foreground'
              )}>
                {mfo.calculatedRate === 0 ? '0%' : `${mfo.calculatedRate}%`}
              </span>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">Шанс</span>
              </div>
              <span className={cn(
                'font-semibold',
                mfo.approvalChance >= 85 ? 'text-green-600' : 'text-foreground'
              )}>
                {mfo.approvalChance}%
              </span>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Время</span>
              </div>
              <span className="font-semibold text-foreground">
                {mfo.decisionTime === 0 ? '⚡' : `${mfo.decisionTime}м`}
              </span>
            </div>
          </div>

          {/* Сумма к возврату */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 mb-4">
            <div>
              <span className="text-xs text-muted-foreground">К возврату</span>
              <p className="text-lg font-bold text-foreground">
                {mfo.totalRepayment.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Переплата</span>
              <p className={cn(
                'font-semibold',
                mfo.overpayment === 0 ? 'text-green-600' : 'text-foreground'
              )}>
                {mfo.overpayment === 0 
                  ? '0 ₽' 
                  : `${mfo.overpayment.toLocaleString('ru-RU')} ₽`
                }
              </p>
            </div>
          </div>

          {/* Бейджи */}
          {mfo.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {mfo.badges.slice(0, 4).map((badge, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2"
              size="lg"
              onClick={onGetLoan}
              disabled={!mfo.isAvailable}
            >
              {mfo.isAvailable ? (
                <>
                  Получить {amount.toLocaleString('ru-RU')} ₽
                  <ExternalLink className="h-4 w-4" />
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Недоступно
                </>
              )}
            </Button>
            
            <Button
              variant={isInCompare ? 'default' : 'outline'}
              size="lg"
              onClick={onToggleCompare}
              disabled={!mfo.isAvailable}
            >
              {isInCompare ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Предупреждение о недоступности */}
          {!mfo.isAvailable && mfo.unavailableReason && (
            <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {mfo.unavailableReason}
              </p>
            </div>
          )}

          {/* Расширенная информация */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-center w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span>Подробнее</span>
                <ChevronDown className={cn(
                  'h-4 w-4 ml-1 transition-transform',
                  isOpen && 'rotate-180'
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {/* Условия */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Сумма:</span>
                  <span className="font-medium">
                    {mfo.minAmount.toLocaleString('ru-RU')} – {mfo.maxAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Срок:</span>
                  <span className="font-medium">
                    {mfo.minTerm} – {mfo.maxTerm} дней
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ПСК:</span>
                  <span className="font-medium">
                    {mfo.psk ? `${mfo.psk}%` : 'до 292%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Одобрение:</span>
                  <span className="font-medium">{mfo.approvalRate}%</span>
                </div>
              </div>
              
              {/* Особенности */}
              <div className="flex flex-wrap gap-2">
                {mfo.badCreditOk && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3 text-green-500" />
                    С плохой КИ
                  </div>
                )}
                {mfo.noCalls && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <PhoneOff className="h-3 w-3 text-green-500" />
                    Без звонков
                  </div>
                )}
                {mfo.roundTheClock && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Moon className="h-3 w-3 text-green-500" />
                    24/7
                  </div>
                )}
                {mfo.decisionTime <= 5 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    Быстро
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </motion.div>
  );
}
