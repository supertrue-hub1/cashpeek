'use client';

import { AlertCircle, Info, Sparkles, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SmartFallbackProps {
  isFallback: boolean;
  isEmpty: boolean;
  fallbackReason?: string;
  searchParams?: {
    exact?: {
      amountRange?: { min: number; max: number };
      termRange?: { min: number; max: number };
    };
    applied?: {
      usedAmountFallback?: boolean;
      usedTermFallback?: boolean;
    };
  };
  amount?: number;
  cityName?: string;
  loanTypeName?: string;
  offersCount: number;
  explanation?: string;
  className?: string;
}

/**
 * Smart Fallback Component
 * 
 * Отображает информацию о fallback-поиске:
 * - Уведомление "Мы не нашли точных совпадений..."
 * - Редакторский контент (объяснение)
 * - Рекомендации по улучшению поиска
 */
export function SmartFallbackComponent({
  isFallback,
  isEmpty,
  fallbackReason,
  searchParams,
  amount,
  cityName,
  loanTypeName,
  offersCount,
  explanation,
  className,
}: SmartFallbackProps) {
  // Не показываем, если это обычный (не fallback) поиск
  if (!isFallback && !isEmpty) {
    return null;
  }
  
  // Пустая страница — критическое уведомление
  if (isEmpty) {
    return (
      <div className={cn('container mx-auto px-4 py-6', className)}>
        <Alert variant="destructive" className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">
            Предложения не найдены
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            <p className="mb-2">
              К сожалению, мы не нашли предложений по вашему запросу
              {amount && ` на сумму ${amount.toLocaleString('ru-RU')} ₽`}
              {cityName && ` в ${cityName}`}.
            </p>
            <p className="text-sm">
              Попробуйте изменить параметры поиска или вернуться позже — мы постоянно обновляем базу предложений.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Fallback — информационное уведомление
  return (
    <div className={cn('container mx-auto px-4 py-6', className)}>
      {/* Основной Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">
          Показаны альтернативные варианты
        </AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          {fallbackReason || 'Мы не нашли точных совпадений, но подобрали похожие предложения.'}
        </AlertDescription>
      </Alert>
      
      {/* Карточка с объяснением */}
      <Card className="border-slate-200 bg-slate-50 dark:bg-slate-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Почему показаны эти предложения?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Объяснение */}
          {explanation && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation}
            </p>
          )}
          
          {/* Бейджи с применёнными фильтрами */}
          <div className="flex flex-wrap gap-2">
            {searchParams?.applied?.usedAmountFallback && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Расширен диапазон суммы
              </Badge>
            )}
            {searchParams?.applied?.usedTermFallback && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Расширен диапазон срока
              </Badge>
            )}
            {offersCount > 0 && (
              <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-400 dark:border-green-800">
                Найдено: {offersCount}
              </Badge>
            )}
          </div>
          
          {/* Рекомендации */}
          {amount && (
            <div className="mt-4 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                💡 Рекомендация
              </p>
              <p className="text-sm">
                Для суммы {amount.toLocaleString('ru-RU')} ₽ рассмотрите предложения с максимальной суммой от {(amount * 1.2).toLocaleString('ru-RU')} ₽ — 
                это увеличит шанс одобрения.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Компактная версия для встраивания в другие компоненты
 */
export function SmartFallbackBadge({
  isFallback,
  isEmpty,
  className,
}: {
  isFallback: boolean;
  isEmpty: boolean;
  className?: string;
}) {
  if (!isFallback && !isEmpty) return null;
  
  if (isEmpty) {
    return (
      <Badge 
        variant="destructive" 
        className={cn('text-xs', className)}
      >
        Нет предложений
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="secondary" 
      className={cn('text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', className)}
    >
      Альтернативные варианты
    </Badge>
  );
}

/**
 * Empty State компонент для страниц без офферов
 */
export function EmptySearchFallback({
  amount,
  cityName,
  className,
}: {
  amount?: number;
  cityName?: string;
  className?: string;
}) {
  return (
    <div className={cn('container mx-auto px-4 py-12', className)}>
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <CardTitle className="text-xl">
            Предложения не найдены
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            К сожалению, мы не нашли подходящих предложений
            {amount && ` на сумму ${amount.toLocaleString('ru-RU')} ₽`}
            {cityName && ` в г. ${cityName}`}.
          </p>
          
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 text-left">
            <p className="text-sm font-medium mb-2">Возможные причины:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Слишком большая сумма для первого займа</li>
              <li>Ограниченный выбор МФО в вашем регионе</li>
              <li>Временные технические ограничения</li>
            </ul>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Попробуйте изменить параметры поиска или{' '}
            <a href="/zaimy" className="text-primary hover:underline">
              посмотреть все предложения
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartFallbackComponent;
