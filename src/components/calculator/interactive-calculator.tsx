'use client';

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calculator, Calendar, TrendingUp, Info, CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
  calculateLoan,
  formatCurrency,
  formatNumber,
  formatTerm,
  getPresetAmounts,
  getPresetTerms,
  clamp,
  validateLoanParams,
  type CalculatorResult,
} from '@/lib/utils/calculator';

import { cn } from '@/lib/utils';

interface LoanOffer {
  /** ID оффера */
  id: string;
  /** Название МФО */
  name: string;
  /** Slug для ссылки */
  slug: string;
  /** URL логотипа */
  logo?: string;
  /** URL для оформления */
  affiliateUrl?: string;
  /** Минимальная сумма */
  minAmount: number;
  /** Максимальная сумма */
  maxAmount: number;
  /** Минимальный срок (дней) */
  minTerm: number;
  /** Максимальный срок (дней) */
  maxTerm: number;
  /** Базовая ставка (% в день) */
  baseRate: number;
  /** Ставка для первого займа (0 = бесплатно) */
  firstLoanRate?: number | null;
  /** ПСК (% годовых) */
  psk?: number;
  /** Время принятия решения (минут) */
  decisionTime?: number;
  /** Процент одобрения */
  approvalRate?: number;
}

interface InteractiveCalculatorProps {
  offer: LoanOffer;
  className?: string;
  /** URL для перенаправления после клика */
  redirectUrl?: string;
  /** Показывать ли блок с информацией о МФО */
  showMfoInfo?: boolean;
}

/**
 * Интерактивный калькулятор займа
 * 
 * Синхронизирует состояние с URL через searchParams:
 * - ?amount=15000
 * - ?term=21
 * - ?client=new|repeat
 */
export function InteractiveCalculator({
  offer,
  className,
  redirectUrl,
  showMfoInfo = true,
}: InteractiveCalculatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ============================================
  // Состояние из URL или默认值
  // ============================================
  
  const [amount, setAmount] = React.useState(() => {
    const urlAmount = searchParams.get('amount');
    return urlAmount 
      ? clamp(parseInt(urlAmount, 10), offer.minAmount, offer.maxAmount)
      : Math.round((offer.minAmount + offer.maxAmount) / 2);
  });

  const [term, setTerm] = React.useState(() => {
    const urlTerm = searchParams.get('term');
    return urlTerm
      ? clamp(parseInt(urlTerm, 10), offer.minTerm, offer.maxTerm)
      : 14;
  });

  const [isNewClient, setIsNewClient] = React.useState(() => {
    const urlClient = searchParams.get('client');
    return urlClient !== 'repeat';
  });

  const [manualAmount, setManualAmount] = React.useState(amount.toString());

  // ============================================
  // Вычисления
  // ============================================

  const isFirstLoanZero = offer.firstLoanRate === 0 || offer.firstLoanRate === null;
  const currentRate = isNewClient && isFirstLoanZero ? 0 : offer.baseRate;

  const result: CalculatorResult = React.useMemo(() => {
    return calculateLoan({
      amount,
      term,
      dailyRate: offer.baseRate,
      isFirstLoanZero,
      isNewClient,
    });
  }, [amount, term, offer.baseRate, isFirstLoanZero, isNewClient]);

  // ============================================
  // Preset значения
  // ============================================

  const presetAmounts = React.useMemo(() => 
    getPresetAmounts(offer.minAmount, offer.maxAmount, 5),
    [offer.minAmount, offer.maxAmount]
  );

  const presetTerms = React.useMemo(() => 
    getPresetTerms(offer.minTerm, offer.maxTerm),
    [offer.minTerm, offer.maxTerm]
  );

  // ============================================
  // Синхронизация с URL
  // ============================================

  const updateUrl = React.useCallback((newAmount: number, newTerm: number, newIsNewClient: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('amount', newAmount.toString());
    params.set('term', newTerm.toString());
    params.set('client', newIsNewClient ? 'new' : 'repeat');
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // ============================================
  // Обработчики событий
  // ============================================

  const handleAmountChange = (value: number) => {
    const clamped = clamp(value, offer.minAmount, offer.maxAmount);
    setAmount(clamped);
    setManualAmount(clamped.toString());
    updateUrl(clamped, term, isNewClient);
  };

  const handleManualAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseAmount(e.target.value);
    setManualAmount(e.target.value);
    
    if (!isNaN(value) && value >= offer.minAmount && value <= offer.maxAmount) {
      setAmount(value);
      updateUrl(value, term, isNewClient);
    }
  };

  const handleTermChange = (value: number) => {
    const clamped = clamp(value, offer.minTerm, offer.maxTerm);
    setTerm(clamped);
    updateUrl(amount, clamped, isNewClient);
  };

  const handleClientTypeChange = (value: string) => {
    const newIsNewClient = value === 'new';
    setIsNewClient(newIsNewClient);
    updateUrl(amount, term, newIsNewClient);
  };

  const handlePresetAmountClick = (preset: number) => {
    handleAmountChange(preset);
  };

  const handlePresetTermClick = (preset: number) => {
    handleTermChange(preset);
  };

  // ============================================
  // Обработка кнопки "Получить"
  // ============================================

  const handleGetLoan = () => {
    // Формируем URL с параметрами для МФО
    const params = new URLSearchParams();
    params.set('amount', amount.toString());
    params.set('term', term.toString());
    params.set('client', isNewClient ? 'new' : 'repeat');
    
    const targetUrl = redirectUrl || offer.affiliateUrl || '#';
    const finalUrl = targetUrl.includes('?') 
      ? `${targetUrl}&${params.toString()}`
      : `${targetUrl}?${params.toString()}`;
    
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Калькулятор займа</CardTitle>
        </div>
        {showMfoInfo && (
          <CardDescription>
            Рассчитайте условия займа в {offer.name}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ============================================ */}
        {/* Выбор типа клиента */}
        {/* ============================================ */}
        
        <div className="space-y-3">
          <Label className="text-sm font-medium">Тип клиента</Label>
          <Tabs 
            value={isNewClient ? 'new' : 'repeat'} 
            onValueChange={handleClientTypeChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Новый клиент
              </TabsTrigger>
              <TabsTrigger value="repeat">
                Повторный
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isNewClient && isFirstLoanZero && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Первый займ под 0%
            </Badge>
          )}
        </div>

        <Separator />

        {/* ============================================ */}
        {/* Сумма займа */}
        {/* ============================================ */}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Сумма займа</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={manualAmount}
                onChange={handleManualAmountChange}
                className="w-28 text-right font-mono"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">₽</span>
            </div>
          </div>

          {/* Preset кнопки */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetAmountClick(preset)}
                className="font-mono"
              >
                {formatNumber(preset)}
              </Button>
            ))}
          </div>

          {/* Slider */}
          <Slider
            value={[amount]}
            onValueChange={([value]) => handleAmountChange(value)}
            min={offer.minAmount}
            max={offer.maxAmount}
            step={500}
            className="py-2"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(offer.minAmount)}</span>
            <span>{formatCurrency(offer.maxAmount)}</span>
          </div>
        </div>

        <Separator />

        {/* ============================================ */}
        {/* Срок займа */}
        {/* ============================================ */}

        <div className="space-y-4">
          <Label className="text-sm font-medium">Срок займа</Label>

          {/* Preset кнопки */}
          <div className="flex flex-wrap gap-2">
            {presetTerms.map((preset) => (
              <Button
                key={preset}
                variant={term === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetTermClick(preset)}
              >
                {preset} дн.
              </Button>
            ))}
          </div>

          {/* Slider */}
          <Slider
            value={[term]}
            onValueChange={([value]) => handleTermChange(value)}
            min={offer.minTerm}
            max={Math.min(offer.maxTerm, 168)} // Max 168 days (6 months)
            step={1}
            className="py-2"
          />

          <div className="text-center">
            <span className="text-2xl font-bold text-foreground">
              {term} {getDaysWord(term)}
            </span>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{offer.minTerm} дней</span>
            <span>{offer.maxTerm} дней</span>
          </div>
        </div>

        <Separator />

        {/* ============================================ */}
        {/* Результат расчёта */}
        {/* ============================================ */}

        <div className="rounded-xl bg-muted/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">К возврату</span>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(result.totalRepayment)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              Дата возврата
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Дата рассчитывается с учётом выходных</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-medium text-foreground">
              {format(result.dueDate, 'd MMMM yyyy', { locale: ru })}
            </span>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Переплата</span>
              <p className={cn(
                "text-lg font-semibold",
                result.isFree ? "text-green-600" : "text-foreground"
              )}>
                {result.isFree 
                  ? '0 ₽' 
                  : formatCurrency(result.overpayment)
                }
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Ставка</span>
              <p className="text-lg font-semibold text-foreground">
                {currentRate}% /день
              </p>
            </div>
          </div>

          {result.isFree && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-center">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                🎉 Вы экономите {formatCurrency(result.overpayment)} на процентах!
              </p>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* CTA Кнопка */}
        {/* ============================================ */}

        <Button 
          size="lg" 
          className="w-full gap-2 text-lg"
          onClick={handleGetLoan}
        >
          🚀 Получить {formatCurrency(amount)}
        </Button>

        {/* Дополнительная информация */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          {offer.decisionTime && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Решение за {offer.decisionTime} мин
            </span>
          )}
          {offer.approvalRate && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Одобрение {offer.approvalRate}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Вспомогательная функция для склонения
// ============================================

function getDaysWord(days: number): string {
  const lastTwo = Math.abs(days) % 100;
  const lastOne = lastTwo % 10;
  
  if (lastTwo > 10 && lastTwo < 20) return 'дней';
  if (lastOne === 1) return 'день';
  if (lastOne >= 2 && lastOne <= 4) return 'дня';
  return 'дней';
}

// ============================================
// Функция парсинга суммы
// ============================================

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}
