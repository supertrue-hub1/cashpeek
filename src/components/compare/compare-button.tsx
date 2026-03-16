/**
 * Compare Button & Compare Panel Component
 * 
 * Кнопка добавления в сравнение
 * + Плавающая панель для перехода к сравнению
 */

'use client';

import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompare } from '@/lib/store/compare-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

interface CompareButtonProps {
  offerId: string;
  offerName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CompareButton({
  offerId,
  offerName,
  variant = 'ghost',
  size = 'icon',
  className,
}: CompareButtonProps) {
  const { isInCompare, toggleCompare, canAdd } = useCompare();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const inCompare = isInCompare(offerId);
  
  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    const success = toggleCompare(offerId);
    
    if (!success) {
      toast.error('Максимум 3 МФО для сравнения', {
        description: 'Уберите одно МФО из сравнения, чтобы добавить другое',
      });
    } else if (!inCompare) {
      toast.success(
        offerName 
          ? `${offerName} добавлен к сравнению` 
          : 'Добавлено к сравнению',
        {
          duration: 2000,
        }
      );
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        "transition-all duration-200",
        inCompare && "text-blue-600 hover:text-blue-700 bg-blue-50",
        isAnimating && "scale-110",
        className
      )}
      title={inCompare ? 'Убрать из сравнения' : 'Сравнить'}
    >
      <Scale className={cn("h-5 w-5", inCompare && "fill-current")} />
    </Button>
  );
}

// ============================================
// Floating Compare Panel
// ============================================

interface ComparePanelProps {
  className?: string;
}

export function ComparePanel({ className }: ComparePanelProps) {
  const { compareIds, count, clearCompare } = useCompare();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Показываем панель если есть элементы
    setIsVisible(count > 0);
  }, [count]);
  
  if (!isVisible || count === 0) return null;
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "bg-white dark:bg-gray-900",
        "border rounded-xl shadow-lg p-4",
        "animate-in slide-in-from-bottom-4",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Scale className="h-5 w-5 text-blue-600" />
        <span className="font-medium">
          К сравнению: <span className="text-blue-600">{count}</span>/3
        </span>
      </div>
      
      <div className="flex gap-2">
        <Button asChild size="sm">
          <Link href="/sravnit?compare=true">
            Сравнить
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearCompare}
        >
          Очистить
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Compare Table Component
// ============================================

interface CompareTableProps {
  offers: any[];
  className?: string;
}

export function CompareTable({ offers, className }: CompareTableProps) {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  
  // Фильтруем только выбранные для сравнения
  const compareOffers = offers.filter(offer => compareIds.includes(offer.id));
  
  if (compareOffers.length === 0) {
    return (
      <div className="text-center py-12">
        <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Выберите МФО для сравнения</h3>
        <p className="text-muted-foreground">
          Добавьте до 3 МФО для детального сравнения условий
        </p>
      </div>
    );
  }
  
  const comparisonRows = [
    { label: 'Сумма', key: 'amount', render: (o: any) => `${o.minAmount} – ${o.maxAmount} ₽` },
    { label: 'Срок', key: 'term', render: (o: any) => `${o.minTerm} – ${o.maxTerm} дней` },
    { label: 'Ставка', key: 'rate', render: (o: any) => `${o.baseRate}%` },
    { label: 'Первый займ', key: 'firstRate', render: (o: any) => o.firstLoanRate ? `${o.firstLoanRate}%` : '—' },
    { label: 'Время решения', key: 'time', render: (o: any) => `${o.decisionTime} мин` },
    { label: 'Вероятность одобрения', key: 'approval', render: (o: any) => `${o.approvalRate}%` },
    { label: 'Выдача', key: 'payout', render: (o: any) => o.payoutMethods?.join(', ') || '—' },
    { label: 'Документы', key: 'docs', render: (o: any) => o.documents?.join(', ') || '—' },
    { label: 'Возраст', key: 'age', render: (o: any) => `от ${o.minAge} лет` },
  ];
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Сравнение МФО</h3>
        <Button variant="outline" size="sm" onClick={clearCompare}>
          Очистить всё
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left bg-muted/50 border min-w-[150px]"></th>
              {compareOffers.map(offer => (
                <th 
                  key={offer.id} 
                  className="p-3 text-center border bg-muted/50 min-w-[180px]"
                >
                  <div className="flex flex-col items-center gap-2">
                    {offer.logo && (
                      <img src={offer.logo} alt={offer.name} className="h-10" />
                    )}
                    <span className="font-semibold">{offer.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFromCompare(offer.id)}
                      className="text-muted-foreground"
                    >
                      Убрать
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(row => (
              <tr key={row.key}>
                <td className="p-3 border font-medium text-muted-foreground">
                  {row.label}
                </td>
                {compareOffers.map(offer => (
                  <td key={`${offer.id}-${row.key}`} className="p-3 text-center border">
                    {row.render(offer)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-center gap-4 pt-4">
        {compareOffers.map(offer => (
          <Button 
            key={offer.id}
            asChild
            className="gap-2"
          >
            <a href={offer.affiliateUrl} target="_blank" rel="noopener noreferrer">
              Оформить в {offer.name}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
