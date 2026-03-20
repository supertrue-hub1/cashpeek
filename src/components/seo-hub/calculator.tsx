'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/components/analytics/google-analytics';

interface CalculatorProps {
  defaultAmount?: number;
  defaultTerm?: number;
  minAmount?: number;
  maxAmount?: number;
  baseRate?: number;
}

export function CalculatorComponent({
  defaultAmount = 10000,
  defaultTerm = 14,
  minAmount = 1000,
  maxAmount = 100000,
  baseRate = 0.8,
}: CalculatorProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [term, setTerm] = useState(defaultTerm);
  
  // GA4 Tracking
  const handleAmountChange = ([v]: number[]) => {
    setAmount(v)
    trackEvent('calculator_amount_change', { amount: v, calculator: 'seo_hub' })
  }
  
  const handleTermChange = ([v]: number[]) => {
    setTerm(v)
    trackEvent('calculator_term_change', { term: v, calculator: 'seo_hub' })
  }
  
  // Расчёт переплаты
  const result = useMemo(() => {
    // Ставка в день (базовая 0.8% = 292% годовых)
    const dailyRate = baseRate / 100;
    
    // Переплата
    const overpayment = Math.round(amount * dailyRate * term);
    
    // Итого к возврату
    const totalRepayment = amount + overpayment;
    
    // Ежедневный платёж
    const dailyPayment = Math.round(totalRepayment / term);
    
    return {
      totalRepayment,
      overpayment,
      dailyPayment,
    };
  }, [amount, term, baseRate]);
  
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Калькулятор переплаты</h3>
        </div>
        
        <div className="space-y-6">
          {/* Сумма */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Сумма займа
              </label>
              <Badge variant="secondary" className="text-base font-bold px-3 py-1">
                {amount.toLocaleString('ru-RU')} ₽
              </Badge>
            </div>
            <Slider
              value={[amount]}
              onValueChange={handleAmountChange}
              min={minAmount}
              max={maxAmount}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minAmount.toLocaleString('ru-RU')} ₽</span>
              <span>{maxAmount.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
          
          {/* Срок */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">
                Срок займа
              </label>
              <Badge variant="secondary" className="text-base font-bold px-3 py-1">
                {term} дней
              </Badge>
            </div>
            <Slider
              value={[term]}
              onValueChange={handleTermChange}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 день</span>
              <span>30 дней</span>
            </div>
          </div>
          
          {/* Результаты */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">К возврату</p>
              <p className="text-xl font-bold text-foreground">
                {result.totalRepayment.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Переплата</p>
              <p className="text-xl font-bold text-orange-600">
                {result.overpayment.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
          
          {/* Предупреждение */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-xs text-orange-700 dark:text-orange-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Расчёт примерный. Итоговая сумма зависит от условий конкретной МФО.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
